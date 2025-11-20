const request = require('supertest');
const app = require('./server');
const mongoose = require('mongoose');

// 1. Mock Mongoose to prevent actual DB connections during tests
jest.mock('mongoose', () => ({
    connect: jest.fn(),
    Schema: jest.fn(),
    model: jest.fn().mockImplementation(() => ({
        findOneAndUpdate: jest.fn().mockResolvedValue({ username: "testuser", goals: "balanced" })
    })),
    connection: { host: 'localhost' },
}));

// 2. Mock Google AI to prevent API charges and ensure deterministic results
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: {
                    text: () => JSON.stringify([{
                        name: "Test Salad",
                        nutrition: { calories: 200, protein: "10g", carbs: "5g", fats: "2g" },
                        instructions: ["Mix ingredients"],
                        missingIngredients: []
                    }])
                }
            })
        })
    }))
}));

describe('API Endpoints', () => {

    it('GET /api/health should return status OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'OK');
    });

    it('POST /api/recommend should return generated recipes', async () => {
        const res = await request(app)
            .post('/api/recommend')
            .send({
                pantry: 'lettuce, tomato',
                userGoal: 'weight-loss',
                budget: 'low'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data[0].name).toBe("Test Salad");
    });

});
