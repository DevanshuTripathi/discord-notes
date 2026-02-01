const bodyParser = require('body-parser');
const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { time } = require('console');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-vercel-app.vercel.app',
  ],
}));


const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

bot.once('ready', () => {
    console.log(`${bot.user.tag} is online!`);
})

bot.login(process.env.DISCORD_TOKEN);

const CHANNEL_ID = process.env.CHANNEL_ID;

app.post('/add-note', async (req, res) => {
    const { subject, content } = req.body;
    try {
        const channel = await bot.channels.fetch(CHANNEL_ID);
        const note = {
            subject,
            content,
            time: new Date().toISOString(),
        };
        await channel.send(JSON.stringify(note));
        res.status(200).send('Note added!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding note.');
    }
});

app.get('/get-notes', async (req, res) => {
    try {
        const channel = await bot.channels.fetch(CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 100 });

        const notes = [...messages.values()]
            .map(msg => {
                try {
                    return {
                        id: msg.id,
                        ...JSON.parse(msg.content),
                    };
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
            .reverse();
        
        res.status(200).json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching notes.');
    }
});

app.post('/edit-note', async (req, res) => {
    const { id, subject, content } = req.body;
    try {
        const channel = await bot.channels.fetch(CHANNEL_ID);
        const message = await channel.messages.fetch(id);
        const note = {
            subject,
            content,
            time: new Date().toISOString(),
        };
        await message.edit(JSON.stringify(note));
        res.status(200).send('Note updated!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error editing note.');
    }
});

app.delete('/delete-note', async (req, res) => {
    const { id } = req.body;
    try {
        const channel = await bot.channels.fetch(CHANNEL_ID);
        const message = await channel.messages.fetch(id);
        await message.delete();
        res.status(200).send('Note deleted!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting note.');
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Backend is running on port ${PORT}`);
});