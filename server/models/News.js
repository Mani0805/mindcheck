
const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: ""
        },
        content: {
            type: String,
            default: ""
        },
        score: {
            type: Number,
            default: null
        }
    },
    {
        _id: false
    }
);

const newsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },

        content: {
            type: String,
            required: true
        },

        prediction: {
            type: String,
            default: "Not Analyzed"
        },

        confidence: {
            type: Number,
            default: 0
        },

        analysis: {
            type: String,
            default: ""
        },

        keyClaims: {
            type: [String],
            default: []
        },

        recommendation: {
            type: String,
            default: ""
        },

        sources: {
            type: [sourceSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("News", newsSchema);
