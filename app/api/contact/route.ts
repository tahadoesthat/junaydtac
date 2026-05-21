import { NextResponse } from 'next/server';

const DISCORD_WEBHOOK_URL = "[https://discord.com/api/webhooks/1507082690837483590/gLlRzknuyQaFtpLcQdSjOP1NCM_50PYH7SjBKglA-fWgnaQF2PtrhdMHwQwoZpxqvtop](https://discord.com/api/webhooks/1507082690837483590/gLlRzknuyQaFtpLcQdSjOP1NCM_50PYH7SjBKglA-fWgnaQF2PtrhdMHwQwoZpxqvtop)";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, contact, message } = body;

        if (!name || !message || !contact) {
            return NextResponse.json({ error: 'Missing required validation parameters.' }, { status: 400 });
        }

        const discordPayload = {
            embeds: [
                {
                    title: "🚨 INBOUND TRANSMISSION",
                    color: 0x0A0A0A,
                    fields: [
                        { name: "Entity Name", value: name, inline: true },
                        { name: "Contact Vector", value: contact, inline: true },
                        { name: "Message Payload", value: message }
                    ],
                    timestamp: new Date().toISOString(),
                    footer: { text: "Taha Acts Architecture Terminal" }
                }
            ]
        };

        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload),
        });

        if (!response.ok) throw new Error(`Discord API responded with status ${response.status}`);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to route transmission.' }, { status: 500 });
    }
}
