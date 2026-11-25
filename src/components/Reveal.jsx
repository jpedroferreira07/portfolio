// Antes fazia o conteúdo aparecer animado ao descer a página. Agora é só um
// invólucro: o conteúdo já aparece pronto, sem animação de rolagem.
export default function Reveal({ as: Tag = 'div', className = '', children, delay, y, ...rest }) {
  void delay
  void y
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  )
}
