// O CSS põe tudo em maiúsculas; o "s" de "APIs" é o plural e fica minúsculo.
const label = (text) =>
  text.includes('APIs') ? (
    <>
      {text.split('APIs')[0]}API<span className="lc">s</span>{text.split('APIs')[1]}
    </>
  ) : (
    text
  )

// Faixa infinita de itens (para no hover e quando as animações estão desligadas)
export default function Marquee({ items }) {
  const row = [...items, ...items]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[...row, ...row].map((it, i) => (
          <span key={i} className="marquee-item">
            <span>{label(it)}</span>
            <span className="marquee-sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
