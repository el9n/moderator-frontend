import { useEffect, useState } from 'react'
import GameOptions from '../GameOptions/GameOptions.jsx'
import fetchJSON from '../../functions/fetchJSON.js'
import classes from './App.module.css'

const DEFAULT_GAME_OPTIONS = {
  template: [
    [5,3,3,3,5,3,3,3,5],
    [3,0,3,3,5,3,3,0,3],
    [3,3,5,3,5,3,5,3,3],
    [3,3,3,8,11,8,3,3,3],
    [5,5,5,11,15,11,5,5,5],
    [3,3,3,8,11,8,3,3,3],
    [3,3,5,3,5,3,5,3,3],
    [3,0,3,3,5,3,3,0,3],
    [5,3,3,3,5,3,3,3,5],
  ],
  rules: {
    '1': {stronghold: 'B'}, 
    '2': {stronghold: 'B'}, 
    '3': {stronghold: 'B'}, 
    '10': {stronghold: 'B'}, 
    '19': {stronghold: 'B'}, 
    '11': {base: 'A'},
    '12': {stronghold: 'A'}, 
    '20': {stronghold: 'A'}, 
    '21': {stronghold: 'A'},

    '7': {stronghold: 'D'}, 
    '8': {stronghold: 'D'}, 
    '9': {stronghold: 'D'}, 
    '18': {stronghold: 'D'}, 
    '27': {stronghold: 'D'}, 
    '17': {base: 'C'},
    '16': {stronghold: 'C'}, 
    '25': {stronghold: 'C'}, 
    '26': {stronghold: 'C'},

    '55': {stronghold: 'C'}, 
    '64': {stronghold: 'C'}, 
    '73': {stronghold: 'C'}, 
    '74': {stronghold: 'C'}, 
    '75': {stronghold: 'C'}, 
    '65': {base: 'D'},
    '56': {stronghold: 'D'}, 
    '57': {stronghold: 'D'}, 
    '66': {stronghold: 'D'},

    '61': {stronghold: 'B'}, 
    '62': {stronghold: 'B'}, 
    '70': {stronghold: 'B'}, 
    '71': {base: 'B'},
    '63': {stronghold: 'A'}, 
    '72': {stronghold: 'A'}, 
    '79': {stronghold: 'A'}, 
    '80': {stronghold: 'A'}, 
    '81': {stronghold: 'A'}, 
  },
  players: {
    A: 'Супер команда красных',
    B: 'Зеленые',
    C: 'Очень длинная команда синих',
    D: 'Оранжевая команда',
  },
  time: 3600000
}

const questions = [
  {
    question: 'Сколько будет 2+2?',
    answer: '4',
    value: 5
  },
  {
    question: 'Какое сейчас время года?',
    answer: 'лето',
    value: 10
  },
  {
    question: 'Что заставило тебя сегодня улыбнуться?',
    answer: 'ничего',
    value: 50
  }
]

function App() {

  const [showNewGamePopup, setShowNewGamePopup] = useState(false)
  const [popup, setPopup] = useState(false)

  const [selectedGame, setSelectedGame] = useState('')
  const [games, setGames] = useState([])
  const [activeGame, setActiveGame] = useState([])
  const [selectedGameContent, setSelectedGameContent] = useState(null)

  // fetch all games
  useEffect(() => {
    fetchJSON('info.php', setGames)
  }, [])

  // fetch active game
  useEffect(() => {
    fetchJSON('current_game.php', setActiveGame)
  }, [])

  // fetch the selected game
  useEffect(() => {
    selectedGame && fetchJSON('info.php?' + selectedGame, setSelectedGameContent)
  }, [selectedGame])

  return (
    <>
      <p>
        { games.map(game => <button key={game} onClick={() => {
          setPopup(true)
          setSelectedGame(game)
        }}>{ game }</button>) }
        {' '}
        <button onClick={() => setShowNewGamePopup(true)}>Добавить игру</button>
      </p>
      { 
        selectedGameContent && 
        <GameOptions
          key={popup}
          open={popup}
          onOpenChange={setPopup}
          options={selectedGameContent.options}
          questions={selectedGameContent.questions}/>
      }
      <GameOptions 
        editable
        options={DEFAULT_GAME_OPTIONS}
        questions={questions}
        open={showNewGamePopup} 
        onSubmit={game => fetchWithReload('new_game.php', {
          method: 'POST',
          body: JSON.stringify(game)
        })}
        onOpenChange={setShowNewGamePopup}/>
      <p>
        Активная игра:
        {' '}
        <select value={activeGame.name} onChange={e => fetchWithReload('current_game.php?' + e.target.value)}>
          <option key='empty' value='null'>Не выбрано</option>
          {
            games.map(game => <option key={game} value={game}>{ game }</option>)
          }
        </select>
        {' '}
        [{activeGame.isPaused ? 'на паузе' : 'запущена'}]
        {' '}
        <button onClick={() => fetchWithReload('toggle_game.php')}>
          {activeGame.isPaused ? 'Запустить' : 'Остановить'}
        </button>
      </p>
    </>
  )
}

function fetchWithReload(url, params) {
  fetch(url, params).then(() => location.reload())
}

export default App
