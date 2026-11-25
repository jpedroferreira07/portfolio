// Moldura da imagem do projeto. Fica sempre igual: sem inclinação, sem brilho e
// sem mudança ao passar o mouse, para a imagem manter a qualidade.
export default function HoloFrame({ children, className = '' }) {
  return (
    <div className={`holo-wrap ${className}`}>
      <div className="holo">{children}</div>
    </div>
  )
}
