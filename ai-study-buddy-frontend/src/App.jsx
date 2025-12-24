import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Common/Sidebar';
import Header from './components/Common/Header';
import AIChat from './components/AIChat/AIChat';
import Quiz from './components/Quiz/Quiz';
import StudyPlan from './components/StudyPlan/StudyPlan';
import Flashcards from './components/Flashcards/Flashcards';
import { StudyBuddyProvider } from './context/StudyBuddyContext';
import './styles/App.css';

function App() {
  return (
    <StudyBuddyProvider>
      <Router>
        <div className="app">
          <Sidebar />
          <div className="main-content">
            <Header />
            <main className="content">
              <Routes>
                <Route path="/" element={<AIChat />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/study-plan" element={<StudyPlan />} />
                <Route path="/flashcards" element={<Flashcards />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </StudyBuddyProvider>
  );
}

export default App;
