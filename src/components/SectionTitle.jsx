// Cabeçalho de seção: título grande com o final da palavra em azul, a legenda logo
// abaixo e uma linha fina embaixo. Serve para Projetos, Experiência e Contato.
// Espaço que a fonte deixa à esquerda de cada letra grande (em em), medido na Geist.
// Compensa para a borda da letra ficar alinhada com a legenda e a linha abaixo.
const BEARING = { E: 0.09, P: 0.09, C: 0.04 }

export default function SectionTitle({ id, text, caption }) {
  return (
    <div className="sec-head">
      <h2 id={id} className="sec-title" style={{ marginLeft: `-${BEARING[text[0]] ?? 0.07}em` }}>
        {text}
      </h2>
      {caption && <p className="sec-cap">{caption}</p>}
      <span className="sec-rule" aria-hidden="true" />
    </div>
  )
}
