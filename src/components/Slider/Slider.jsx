import classes from './Slider.module.css'

function Slider({ label, value, onChange, min=2, max=10, formating, editable=true }) {
  return (
    <div className={classes['container']}>
      <span className={classes['label']}>{ label }</span>
      {
        editable &&
        <input
          className={classes['slider']}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          type='range' 
          min={min} 
          max={max} />
      }
      <span className={classes['value']}>
        { typeof formating === 'function' ? formating(value) : value }
      </span>
    </div>
  )
}

export default Slider