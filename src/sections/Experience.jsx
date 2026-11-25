import { pick, useLang } from '../i18n/lang.js'
import { education, experience, languages, skills } from '../data/profile.js'
import SectionTitle from '../components/SectionTitle.jsx'

// Uma linha no formato padrão da seção: destaque + apoio | descrição | período/nível
function Row({ item, lang }) {
  return (
    <li className="xp">
      <div className="xp-head">
        <h4 className="xp-role">{pick(item.title, lang)}</h4>
        {item.sub && <p className="xp-org">{item.sub}</p>}
      </div>
      <p className="xp-text">{item.text ? pick(item.text, lang) : ''}</p>
      <p className="xp-period">{item.meta ? pick(item.meta, lang) : ''}</p>
    </li>
  )
}

// Célula lado a lado (Idiomas e Competências): mesma tipografia e mesmas linhas das
// linhas de Atuação e Formação, mas em colunas em vez de empilhadas
function Cell({ item, lang }) {
  return (
    <li className={`xp-cell${item.nowrap ? ' nowrap' : ''}${item.wide ? ' wide' : ''}${item.medium ? ' medium' : ''}`}>
      <h4 className="xp-role">{pick(item.title, lang)}</h4>
      {item.text && <p className="xp-text">{pick(item.text, lang)}</p>}
    </li>
  )
}

function Block({ label, items, lang, cols = false, fit = false, extra = null }) {
  return (
    <div className="xp-block">
      <h3 className="k">{label}</h3>
      <ol className={cols ? `xp-cols${fit ? ' fit' : ''}` : 'xp-list'}>
        {items.map((item) =>
          cols ? (
            <Cell key={pick(item.title, lang)} item={item} lang={lang} />
          ) : (
            <Row key={pick(item.title, lang)} item={item} lang={lang} />
          ),
        )}
        {extra}
      </ol>
    </div>
  )
}

// Aprendizados: mesma linha padrão (título | conteúdo | período), logo abaixo da atuação
function LearnRow({ item, lang, label }) {
  if (!item?.learnings) return null
  return (
    <li className="xp xp-learn-row">
      <div className="xp-head">
        <h4 className="xp-role">{label}</h4>
        {item.sub && <p className="xp-org">{item.sub}</p>}
      </div>
      <ul className="learn-list">
        {item.learnings[lang].map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </li>
  )
}

export default function Experience() {
  const { lang, t } = useLang()

  return (
    <section id="experience" className="sec xp-sec" aria-labelledby="experience-title">
      <div className="wrap">
        <SectionTitle id="experience-title" text={t.experience.label} caption={t.experience.caption} />
        <Block
          label={t.experience.work}
          items={experience}
          lang={lang}
          extra={<LearnRow item={experience[0]} lang={lang} label={t.experience.learned} />}
        />
        <Block label={t.experience.education} items={education} lang={lang} />
        <Block label={t.experience.languages} items={languages} lang={lang} cols />
        <Block label={t.experience.skills} items={skills} lang={lang} cols fit />
      </div>
    </section>
  )
}
