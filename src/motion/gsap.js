// GSAP com o plugin ScrollTrigger registrado uma única vez
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Em desenvolvimento, deixa o ScrollTrigger acessível no console para depurar
if (import.meta.env.DEV) window.ScrollTrigger = ScrollTrigger

export { gsap, ScrollTrigger }
