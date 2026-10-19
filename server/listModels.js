
require("dotenv").config();
const Groq = require("groq-sdk");

async function listModels() {
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    const response = await groq.models.list();

    console.log("Models available to your account:");

    response.data
        .filter(model => model.active !== false)
        .forEach(model => console.log(model.id));
}

listModels().catch(error => {
    console.error("Could not list models:", error.message);
});
