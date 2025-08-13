import { Log } from "@/dbConnection/Schema/logs";

async function queueLog(logData: { level: string; message: string; }) {
    try {
        const newLog = new Log({
            timestamp: new Date(),
            level: logData.level,
            message: logData.message
        });
        await newLog.save();
    } catch (err) {
        console.error("Failed to save log:", err);
    }
}

export default queueLog;