import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogClose
} from '../Dialog'
import GameField from '../GameField/GameField'
import Player from '../Player/Player'
import Slider from '../Slider/Slider'
import Question from '../Question/Question'
import { addRule, calcTemplateValues, getBaseIndex, getCellByIndex, getStrongholdIndexes, pretifyCellValue, removeRule, setCellByIndex } from '../../functions/gameUtils'
import formatMinutes from '../../functions/formatTime'
import cloneObj from '../../functions/cloneObj'
import classes from './GameOptions.module.css'
import tabsClasses from './Tabs.module.css'

const PLAYER_COLORS = {
  A: ['red', 'white'] ,
  B: ['green', 'white'],
  C: ['blue', 'white'],
  D: ['orange', 'black'],
  E: ['yellow', 'black'],
  F: ['magenta', 'black'],
  G: ['pink', 'black'],
  H: ['cyan', 'black']
}

const INICATOR_ICONS = {
  'base': '◼',
  'stronghold': '◻'
}

function GameOptions({ options, questions=[], open, onOpenChange, editable=false, onSubmit }) {
 
  const [stage, setStage] = useState(0)
  const [gameFieldTabIndex, setGameFieldTabIndex] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [objectType, setobjectType] = useState('stronghold')

  const [localOptions, setLocalOptions] = useState(options)
  const [localQuestions, setLocalQuestions] = useState(questions)
  const [gameName, setGameName] = useState(new Date().toISOString().split('T')[0])

  const finalGame = {
    options: localOptions,
    questions: localQuestions,
    history: []
  }

  const playersAmount = Object.keys(localOptions.players).length
  const templateSize = localOptions.template.length

  const handleTimeChange = time => {
    setLocalOptions(lo => {
      const newState = cloneObj(lo)

      newState.time = time

      return newState
    })
  }
  const handleTemplateSizeChange = size => {
    

    if (size === templateSize) {
      return
    }

    setLocalOptions(lo => {
      const newState = cloneObj(lo)

      if (size > templateSize) {
        // the size has increased
        
        // fill the existings rows
        for (let i = 0; i < templateSize; i++) {
          for (let k = templateSize; k < size; k++) {
            newState.template[i][k] = 0
          }
        }
        // add new rows
        for (let i = templateSize; i < size; i++) {
          newState.template[i] = []
          for (let k = 0; k < size; k++) {
            newState.template[i][k] = 0
          }
        }

      } else {
        // the size has decreased
        
        newState.template.splice(-1 * (templateSize - size))
        newState.template.forEach(row => row.splice(-1 * (templateSize - size)))
      }

      // empty the rules
      newState.rules = {}

      return newState
    })
  }
  const handlePlayersAmountChange = amount => {
    if (amount === Object.keys(localOptions.players).length) {
      return
    }

    setLocalOptions(lo => {
      const newState = cloneObj(lo)

      if (amount > Object.keys(newState.players).length) {
        // the amound has increased

        for (let i = Object.keys(newState.players).length; i < amount; i++) {
          newState.players[Object.keys(PLAYER_COLORS)[i]] = ''
        }
      } else {
        // the amound has decreased
        
        newState.players = Object.fromEntries(Object.entries(newState.players).splice(0, amount))
        // remove the unused players from the rules
        newState.rules =  Object.fromEntries(Object.entries(newState.rules).filter(entry => Object.keys(newState.players).includes(Object.values(entry[1])[0])))
      }

      return newState
    })
  }
  const handlePlayerNameChange = (letter, name) => {
    if (!(letter in localOptions.players)) {
      return
    }

    setLocalOptions(lo => {
      const newState = cloneObj(lo)

      newState.players[letter] = name

      return newState
    })
  }
  const handleCellValueChange = (index, value) => {
    setLocalOptions(lo => {
      const newState = cloneObj(lo)

      newState.template = setCellByIndex(lo.template, index, value)

      return newState
    })
  }
  const handleCellObjectChange = (index, type) => {
    /**
     * lmb - add object
     * rmb - remove object
     */

    if (!((selectedPlayer || type === 'rmb') && objectType)) {
      return
    }

    setLocalOptions(lo => {
      const newState = cloneObj(lo)

      if (type === 'lmb') {
        // remove the previous base if the new object is base
        if (objectType === 'base') {
          newState.rules = removeRule(newState.rules, getBaseIndex(newState.rules, selectedPlayer))
        }
        newState.rules = addRule(newState.rules, index, {[objectType]: selectedPlayer})
      } else {
        newState.rules = removeRule(newState.rules, index)
      }

      return newState
    })
  }
  const handleSelectedPlayerChange = (player, type) => {
    const object = type === 'lmb' ? 'stronghold' : 'base'
    setSelectedPlayer(sp => (sp === player && objectType === object) ? null : player)
    setobjectType(object)
  }
  const handleQuestionsChange = (index, question) => {
    setLocalQuestions(lq => {
      const newState = cloneObj(lq)

      newState[index] = question

      return newState
    })
  }
  const handleQuestionsDelete = deletedIndex => {
    setLocalQuestions(lq => {
      return lq.filter((value, index) => index !== deletedIndex)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className={classes['content']}>
          
          { STAGES[stage]?.({ finalGame, gameName, editable, setGameName, playersAmount, options:localOptions, questions: localQuestions, tabIndex: gameFieldTabIndex, selectedPlayer, templateSize, objectType, setTabIndex: setGameFieldTabIndex, handlePlayersAmountChange, handleCellValueChange, handleCellObjectChange, handleTemplateSizeChange, handleTimeChange, handleQuestionsChange, handleQuestionsDelete }) }

          <div className={classes['help-bar']}>
            <div className={classes['players-bar'] + ((stage !== 0) ? (' ' + classes['short']) : '')}>
              { 
                Object.entries(localOptions.players).map(([letter, name]) => 
                  <Player 
                    editable={editable && stage === 0}
                    short={stage !== 0}
                    key={letter} 
                    letter={letter} 
                    name={name}
                    stats={stage !== 0 && (
                      // start score (value of the base)
                      (pretifyCellValue(getCellByIndex(localOptions.template, getBaseIndex(localOptions.rules, letter))))
                      + '/' +
                      // combined value of the strongholds
                      (getStrongholdIndexes(localOptions.rules, letter).map(index => getCellByIndex(localOptions.template, index)).reduce((acc, curr) => acc + curr, 0))
                    )}
                    color={PLAYER_COLORS[letter]}
                    onClick={(stage === 1 && gameFieldTabIndex === 1) && handleSelectedPlayerChange}
                    onNameChange={handlePlayerNameChange} />) 
              }
            </div>
            {
              stage === 1 && gameFieldTabIndex === 1 &&
              <div>
                <p>
                  Для <b>добавление</b> объекта на поле кликните <i>левой кнопкой мыши</i> по клетке. <br/>
                  Для <b>удаления</b> объекта с поля кликните <i>правой кнопкой мыши</i> по клетке.
                </p>
                <p>
                  Для выбора объекта кликните на значек нужной команды. <br/>
                  <i>Левая кнопка мыши</i> - <b>Стронгхолд</b>, <i>Правая кнопка мыши</i> - <b>База</b>.
                </p>
              </div>
            }
            {
              stage === 1 && gameFieldTabIndex === 0 &&
              <div>
                <p>Общая стоимость клеток: { calcTemplateValues(localOptions.template) }</p>
              </div>
            }
            {
              stage === 2 &&
              <div>
                <p>Ответы не чувствительны к регистру</p>
              </div>
            }
            {
              editable && stage === 3 &&
              <div>
                <p>Игра будет сохранена как &quot;{ gameName }.json&quot;</p>
              </div>
            }
          </div>

        </div>
        <div className={classes['buttons-panel']}>
          {
            stage === 0
              ? <DialogClose>Закрыть</DialogClose>
              : <button onClick={() => setStage(s => s - 1)}>Назад</button>
          }
          {
            stage < STAGES.length - 1
              ? <button onClick={() => setStage(s => s + 1)}>Далее</button>
              : <button onClick={() => {
                onOpenChange?.(false)
                editable && onSubmit?.({name: gameName, data: finalGame})
              }}>{ editable ? 'Создать игру' : 'Закрыть' }</button>
          }
        </div>
      </DialogContent>
    </Dialog>
  )
}

const STAGES = [

  ({ options, editable, playersAmount, templateSize, handleTemplateSizeChange, handlePlayersAmountChange, handleTimeChange }) =>
    <div>
      <Slider
        editable={editable}
        label='Размер поля'
        value={templateSize}
        min={2}
        max={26}
        onChange={handleTemplateSizeChange}/>
      <Slider
        editable={editable}
        label='Количество игроков'
        value={playersAmount}
        min={2}
        max={8}
        onChange={handlePlayersAmountChange}/>
      <Slider
        editable={editable}
        label='Время'
        value={options.time / 60000}
        formating={formatMinutes}
        min={1}
        max={300}
        onChange={mins => handleTimeChange(mins*60000)}/>
    </div>,

  ({ options, editable, tabIndex, setTabIndex, handleCellValueChange, selectedPlayer, handleCellObjectChange, objectType }) => {

    const gameFieldProps = {
      options,
      playerColors: PLAYER_COLORS,
      
      editable: editable && tabIndex === 0,
      onValueChange: tabIndex === 0 ? handleCellValueChange : undefined,

      activePlayer: tabIndex === 1 ? selectedPlayer : undefined,
      IndicatorIcon: tabIndex === 1 ? INICATOR_ICONS[objectType] : undefined,
      onCellClick: tabIndex === 1 ? handleCellObjectChange : undefined
    }

    return (
      <div>
        {
          editable &&
          <div className={tabsClasses['tabs']}>
            <button className={tabIndex === 0 ? tabsClasses['activeTab'] : null} onClick={() => setTabIndex(0)}>Стоимость клеток</button>
            <button className={tabIndex === 1 ? tabsClasses['activeTab'] : null} onClick={() => setTabIndex(1)}>Расположение баз и стронгхолдов</button>
          </div>
        }
        <GameField {...gameFieldProps}/>
      </div>
    )
  },

  ({ questions, editable, handleQuestionsChange, handleQuestionsDelete }) => {
    return(
      <div className={classes['question-container']}>
        { 
          questions.map((question, index) => 
            <Question 
              key={index}
              editable={editable}
              onChange={newQuestion => handleQuestionsChange(index, newQuestion)}
              onDelete={() => handleQuestionsDelete(index)}
              options={question}/>
          ) 
        }
        {
          editable &&
          <button
            onClick={() => handleQuestionsChange(questions.length, { question: '', answer: '', value: 0})}>
              Добавить вопрос
          </button>
        }
      </div>
    )
  },

  ({ finalGame, gameName, setGameName, editable }) =>
    <div>
      <pre style={{background: '#ccc', color: 'black', padding: '10px', borderRadius: '10px'}}> {JSON.stringify(finalGame, null, 2)} </pre>
      {
        editable &&
        <input type="text" placeholder='Имя игры' className={classes['game-name']} value={gameName} onChange={e => setGameName(e.target.value.trim())}/>
      }
    </div>

]

export default GameOptions
