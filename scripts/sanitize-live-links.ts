#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

interface ScanResult {
  file: string;
  line: number;
  content: string;
  match: string;
}

interface Config {
  placeholder: string;
  excludeDirs: string[];
  includeExtensions: string[];
  dryRun: boolean;
}

class LiveLinkSanitizer {
  private config: Config;
  private urlPattern = /https?:\/\/[^\s\)"'`]+/g;
  
  // Patterns for URLs that should NOT be replaced (safe/internal URLs)
  private safeUrlPatterns = [
    /https?:\/\/localhost/,
    /https?:\/\/127\.0\.0\.1/,
    /https?:\/\/registry\.npmjs\.org/,
    /https?:\/\/aka\.ms\/tsconfig/,
    /https?:\/\/core\.serverless\.com/,
    /https?:\/\/turbo\.build\/schema\.json/,
    /https?:\/\/ui\.shadcn\.com\/schema\.json/,
    /https?:\/\/nextjs\.org\/docs/
  ];

  constructor(config: Config) {
    this.config = config;
  }

  /**
   * Scan for HTTP/HTTPS links in files
   */
  async scan(directory: string): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    await this.scanDirectory(directory, results);
    return results;
  }

  private async scanDirectory(dir: string, results: ScanResult[]): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (this.config.excludeDirs.includes(entry.name)) {
            continue;
          }
          await this.scanDirectory(fullPath, results);
        } else if (entry.isFile()) {
          // Check if file extension is included
          const ext = path.extname(entry.name);
          if (this.config.includeExtensions.includes(ext)) {
            await this.scanFile(fullPath, results);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }

  private async scanFile(filePath: string, results: ScanResult[]): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const matches = line.match(this.urlPattern);
        if (matches) {
          matches.forEach(match => {
            // Skip safe URLs
            if (this.safeUrlPatterns.some(pattern => pattern.test(match))) {
              return;
            }
            
            results.push({
              file: path.relative(process.cwd(), filePath),
              line: index + 1,
              content: line.trim(),
              match: match
            });
          });
        }
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }

  /**
   * Replace HTTP/HTTPS links with placeholder
   */
  async fix(directory: string): Promise<number> {
    let filesModified = 0;
    const modifiedCount = { count: 0 };
    await this.fixDirectory(directory, modifiedCount);
    return modifiedCount.count;
  }

  private async fixDirectory(dir: string, filesModified: { count: number }): Promise<void> {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip excluded directories
          if (this.config.excludeDirs.includes(entry.name)) {
            continue;
          }
          await this.fixDirectory(fullPath, filesModified);
        } else if (entry.isFile()) {
          // Check if file extension is included
          const ext = path.extname(entry.name);
          if (this.config.includeExtensions.includes(ext)) {
            const modified = await this.fixFile(fullPath);
            if (modified) {
              filesModified.count++;
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error fixing directory ${dir}:`, error);
    }
  }

  private async fixFile(filePath: string): Promise<boolean> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      let newContent = content;

      // Replace URLs with placeholder, but skip safe URLs
      const matches = content.match(this.urlPattern);
      if (matches) {
        for (const match of matches) {
          // Skip safe URLs
          if (this.safeUrlPatterns.some(pattern => pattern.test(match))) {
            continue;
          }
          newContent = newContent.replace(match, this.config.placeholder);
        }
      }

      if (newContent !== content) {
        if (!this.config.dryRun) {
          await fs.promises.writeFile(filePath, newContent, 'utf-8');
        }
        console.log(`${this.config.dryRun ? '[DRY RUN] ' : ''}Modified: ${path.relative(process.cwd(), filePath)}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error fixing file ${filePath}:`, error);
      return false;
    }
  }
}

function printHelp() {
  console.log(`
Live Link Sanitizer - Scan and replace hardcoded HTTP/HTTPS links

Usage: node sanitize-live-links.ts [options] [directory]

Options:
  --fix                 Replace found links with placeholder (default: false)
  --placeholder <text>  Placeholder text to replace links (default: "{{EXTERNAL_LINK_PLACEHOLDER}}")
  --dry-run            Show what would be changed without making changes (only with --fix)
  --help               Show this help message

Environment Variables:
  LINK_PLACEHOLDER     Default placeholder text (overridden by --placeholder)

Examples:
  node sanitize-live-links.ts                           # Scan current directory
  node sanitize-live-links.ts --fix                     # Replace links with default placeholder
  node sanitize-live-links.ts --fix --placeholder "LINK" # Replace links with "LINK"
  node sanitize-live-links.ts --fix --dry-run           # Show what would be changed
  node sanitize-live-links.ts ../project                # Scan specific directory
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  // Parse arguments
  let directory = process.cwd();
  let fix = false;
  let placeholder = process.env.LINK_PLACEHOLDER || '{{EXTERNAL_LINK_PLACEHOLDER}}';
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--fix') {
      fix = true;
    } else if (arg === '--placeholder') {
      placeholder = args[++i] || placeholder;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (!arg.startsWith('--')) {
      directory = path.resolve(arg);
    }
  }

  const config: Config = {
    placeholder,
    excludeDirs: ['node_modules', '.git', '.next', 'dist', 'build', '.turbo', '.serverless'],
    includeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.md'],
    dryRun: dryRun && fix
  };

  const sanitizer = new LiveLinkSanitizer(config);

  try {
    if (fix) {
      console.log(`${dryRun ? '[DRY RUN] ' : ''}Replacing HTTP/HTTPS links with: "${placeholder}"`);
      console.log(`Target directory: ${directory}\n`);

      const filesModified = await sanitizer.fix(directory);
      console.log(`\n${dryRun ? '[DRY RUN] ' : ''}${filesModified} file(s) would be modified.`);
    } else {
      console.log('Scanning for HTTP/HTTPS links...');
      console.log(`Target directory: ${directory}\n`);

      const results = await sanitizer.scan(directory);

      if (results.length === 0) {
        console.log('No HTTP/HTTPS links found.');
      } else {
        console.log(`Found ${results.length} HTTP/HTTPS link(s):\n`);

        // Group by file
        const byFile = results.reduce((acc, result) => {
          if (!acc[result.file]) {
            acc[result.file] = [];
          }
          acc[result.file].push(result);
          return acc;
        }, {} as Record<string, ScanResult[]>);

        for (const [file, fileResults] of Object.entries(byFile)) {
          console.log(`📄 ${file}:`);
          fileResults.forEach(result => {
            console.log(`  Line ${result.line}: ${result.match}`);
          });
          console.log();
        }

        console.log('\nTo replace these links with placeholders, run with --fix flag:');
        console.log('  node sanitize-live-links.ts --fix');
        console.log('  node sanitize-live-links.ts --fix --placeholder "YOUR_PLACEHOLDER"');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { LiveLinkSanitizer, ScanResult, Config };