import classes from './Question.module.css'
import cloneObj from '../../functions/cloneObj'

function Question({ options, onChange, onDelete, editable=true }) {
  return(
    <div className={classes['container']}>
      <input 
        className={classes['question']} 
        onChange={e => {
          const newState = cloneObj(options)

          newState.question = e.target.value

          onChange?.(newState)
        }}
        type="text" 
        placeholder='Вопрос' 
        disabled={!editable}
        value={ options?.question }/>
      <input 
        className={classes['answer']} 
        onChange={e => {
          const newState = cloneObj(options)

          newState.answer = e.target.value

          onChange?.(newState)
        }}
        type="text" 
        placeholder='Ответ' 
        disabled={!editable}
        value={ options?.answer }/>
      <input 
        className={classes['value']} 
        onChange={e => {
          const newState = cloneObj(options)

          newState.value = Number(e.target.value)

          onChange?.(newState)
        }}
        type="number" 
        min={0} 
        max={99}
        disabled={!editable}
        value={ options?.value }/>
      {
        editable &&
        <button className={classes['delete']} onClick={onDelete}>Удалить</button>
      }
    </div>
  )
}

export default Question