import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Layout from './pages/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BlogTitles from './pages/BlogTitles.jsx'
import WriteArticle from './pages/WriteArticle.jsx'
import ReviewResume from './pages/ReviewResume.jsx'
import RemoveObject from './pages/RemoveObject.jsx'
import RemoveBackground from './pages/RemoveBackground.jsx'
import GenerateImages from './pages/GenerateImages.jsx'
import Community from './pages/Community.jsx'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import Game from './pages/Game.jsx'

function App() {
  return (
    <div >
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/ai" element={<Layout />}>
          <Route index element={<Dashboard />} /> 
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="Blog-Titles" element={<BlogTitles />} />
          <Route path="write-article" element={<WriteArticle />} />
          <Route path="review-resume" element={<ReviewResume />} />
          <Route path="remove-object" element={<RemoveObject />} />
          <Route path="remove-background" element={<RemoveBackground />} />
          <Route path="generate-images" element={<GenerateImages />} />
          <Route path="community" element={<Community />} />
          <Route path="game" element={<Game />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
