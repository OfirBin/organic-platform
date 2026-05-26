import { addQuestion, getQuestions } from './actions'

export default async function AdminPage() {
  const questions = await getQuestions()

  return (
    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-black">
      {/* Left Column: Input Form */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-2xl font-bold mb-4">Add New Question</h2>
        <form action={addQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Topic (e.g. SN2)</label>
            <input type="text" name="topic" required className="mt-1 w-full border border-gray-300 p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Source Exam (e.g. 2021 Moed A)</label>
            <input type="text" name="sourceExam" className="mt-1 w-full border border-gray-300 p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Question Text (Optional if image)</label>
            <textarea name="text" rows={3} className="mt-1 w-full border border-gray-300 p-2 rounded"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Answer / Explanation</label>
            <textarea name="answer" required rows={3} className="mt-1 w-full border border-gray-300 p-2 rounded"></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700 transition">
            Save Question
          </button>
        </form>
      </div>

      {/* Right Column: Database View */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Question Bank ({questions.length})</h2>
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {questions.length === 0 ? (
            <p className="text-gray-400">No questions in the database yet.</p>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="bg-gray-50 p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span className="font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded">{q.topic}</span>
                  <span className="font-semibold">{q.sourceExam}</span>
                </div>
                {q.text && <p className="font-semibold mb-2">{q.text}</p>}
                <p className="text-sm text-gray-700 bg-white p-2 border rounded">{q.answer}</p>
                <div className="mt-2 text-xs text-gray-400 font-mono">
                  Ease: {q.stat?.easeFactor} | Studied: {q.stat?.timesStudied}x
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}