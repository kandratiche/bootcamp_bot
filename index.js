const { Bot } = require('grammy');
const fs = require('fs');
require("dotenv").config();

const bot = new Bot(process.env.TOKEN);

function getFreeRooms(timetableArray) {
    const now = new Date();
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' });

    const currentTime = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });

    const allRooms = new Set();
    const usedRooms = new Set();

    timetableArray.forEach(entry => {
        const { day, time, room } = entry;
        
        
        allRooms.add(room);
        if(room.substring(0,2) !== "C1") {
            allRooms.delete(room);
        }
        
        if (day === currentDay) {
            const [start, end] = time.split('-');
            if (start <= currentTime && currentTime < end) {
                usedRooms.add(room);
            }
        }
    });


    const freeRooms = [...allRooms].filter(room => !usedRooms.has(room));
    return freeRooms;
}

bot.command("start", (ctx) => ctx.reply("Hello epta"));

bot.command("freerooms", async (ctx) => {
    const fs = require("fs");

    fs.readFile("./final_timetable.json", "utf8", (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return;
        }

        let final_timetable;

        try {
            final_timetable = JSON.parse(data);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            return;
        }

        const timetableArray = [];

        for (const group in final_timetable) {
            const days = final_timetable[group];
            for (const day in days) {
                const periods = days[day];
                for (const period in periods) {
                    const entry = periods[period];
                    timetableArray.push({
                        group,
                        day,
                        period,
                        ...entry,
                    });
                }
            }
        }


        const freeRooms = getFreeRooms(timetableArray);

        // const blocks = {
        //     1: {
        //         1:[],
        //         2:[],
        //         3:[]
        //     },
        //     2: {
        //         1:[],
        //         2:[],
        //         3:[]
        //     },
        //     3: {
        //         1:[],
        //         2:[],
        //         3:[]
        //     }
        // }

        const blocks = {
            1: [],
            2: [],
            3: []
        }

        freeRooms.forEach(room => {
            const blockNumber = parseInt(room.split('.')[1]);
            // const floor = parseInt(room.split('.')[2]);
            // console.log(floor);
            blocks[blockNumber].push(room);
        })

        ctx.reply(freeRooms.length > 0 ? `Free rooms:\n\nBlock 1:\n${blocks[1].join(', ')}\n\nBlock 2:\n${blocks[2].join(', ')}\n\nBlock 3:\n${blocks[3].join(", ")}` : "No free rooms at the moment.");
    });
});

bot.on("message:text", (msg) => {
    if (msg.message.text === "рома гей") {
        msg.reply("+");
    }
});

bot.start();
console.log('Bot online!');
