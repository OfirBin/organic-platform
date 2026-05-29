import prisma from '../lib/prisma'
import fs from 'fs'
import path from 'path'

async function main() {
    console.log('Starting massive data injection...')

    // Read the JSON file
    const filePath = path.join(process.cwd(), 'master_exams.json', 'ai_studio_code.json')
    const fileData = fs.readFileSync(filePath, 'utf-8')
    const questions = JSON.parse(fileData)

    let count = 0;

    for (const q of questions) {
        await prisma.question.create({
            data: {
                text: q.text,
                answer: q.answer,
                // Stringify the distractors array for SQLite storage
                distractors: JSON.stringify(q.distractors),
                topic: q.topic,
                sourceExam: q.sourceExam,
                // Automatically create the baseline study stats
                stat: {
                    create: {
                        timesStudied: 0,
                        timesCorrect: 0,
                        timesIncorrect: 0,
                        easeFactor: 2.5,
                    }
                }
            }
        })
        count++;
    }

    console.log(`✅ Successfully injected ${count} questions into the database!`)
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })