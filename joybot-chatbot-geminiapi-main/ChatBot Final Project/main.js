import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDJD5Rzi01XBd7vGcBNN-ffMoc2Age5fcQ";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "tunedModels/qcenglish-faqs-gillian-ni968gx3lqn0",
});

const generationConfig = {
    temperature: 0.2,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

let messages = {
    history: [],
};

async function sendMessage() {
    const inputField = document.querySelector(".chat-window input");
    const chatBox = document.querySelector(".chat-window .chat");
    const userMessage = inputField.value.trim();

    if (userMessage.length === 0) return;

    try {
        inputField.value = "";
        
        chatBox.insertAdjacentHTML("beforeend", `
            <div class="user">
                <p>${userMessage}</p>
            </div>
        `);

        chatBox.insertAdjacentHTML("beforeend", `
            <div class="loader"></div>
        `);

        chatBox.scrollTop = chatBox.scrollHeight;

        const chat = model.startChat(messages);
        let result = await chat.sendMessageStream(userMessage);
        
        document.querySelector(".chat-window .chat .loader").remove();

        chatBox.insertAdjacentHTML("beforeend", `
            <div class="model">
                <img src="Joybotlogo.png" alt="Bot">
                <p></p>
            </div>
        `);

        let modelMessages = "";
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            modelMessages += chunkText;
            let botMessage = document.querySelectorAll(".chat-window .chat div.model p");
            botMessage[botMessage.length - 1].insertAdjacentHTML("beforeend", chunkText);
        }

        messages.history.push({ role: "user", parts: [{ text: userMessage }] });
        messages.history.push({ role: "model", parts: [{ text: modelMessages }] });

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        document.querySelector(".chat-window .chat .loader")?.remove();
        chatBox.insertAdjacentHTML("beforeend", `
            <div class="error">
                <p>The message could not be sent. Please try again.</p>
            </div>
        `);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.querySelector(".chat-window input");
    const sendButton = document.querySelector(".chat-window .input-area button");
    const chatWindow = document.querySelector(".chat-window");
    const chatButton = document.querySelector(".chat-button");
    const closeButton = document.querySelector(".chat-window .close");

 
    chatButton?.addEventListener("click", () => {
        document.body.classList.add("chat-open");
        chatWindow.style.display = "flex";  
    });


    closeButton?.addEventListener("click", () => {
        document.body.classList.remove("chat-open");
        chatWindow.style.display = "none";  
    });


    sendButton?.addEventListener("click", sendMessage);


    inputField?.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
});
