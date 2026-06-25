import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Updated to the latest Gemini 3.5 Flash model
export const gemini = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' })