import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });
const exercises: Array<[string, string, string, string, string, string, string]> = [
  ["base-squat", "Agachamento livre", "Pernas", "Composto", "Barra ou peso corporal", "Fortalecimento de quadríceps, glúteos e posteriores.", "Posicione os pés na largura dos ombros. Flexione quadris e joelhos mantendo o tronco estável; suba empurrando o chão."],
  ["base-leg-press", "Leg press", "Pernas", "Composto", "Máquina", "Exercício de força para quadríceps e glúteos.", "Ajuste o banco e os pés. Desça o apoio com controle sem tirar o quadril do encosto e empurre sem travar os joelhos."],
  ["base-lunge", "Avanço alternado", "Pernas", "Composto", "Peso corporal ou halteres", "Trabalha quadríceps, glúteos e equilíbrio.", "Dê um passo à frente, flexione os joelhos com controle e retorne à posição inicial. Alterne os lados."],
  ["base-deadlift", "Levantamento terra romeno", "Posteriores", "Composto", "Barra ou halteres", "Ênfase nos posteriores da coxa e glúteos.", "Mantenha a coluna neutra, leve o quadril para trás e desça o peso junto às pernas até sentir alongamento confortável."],
  ["base-calf", "Elevação de panturrilha", "Panturrilhas", "Isolado", "Máquina ou degrau", "Fortalece os músculos da panturrilha.", "Eleve os calcanhares até a ponta dos pés, pause brevemente e desça com controle dentro de uma amplitude confortável."],
  ["base-bench", "Supino reto", "Peito", "Composto", "Barra ou halteres", "Exercício de empurrar para peitoral, tríceps e ombros.", "Mantenha os pés apoiados e as escápulas estáveis. Desça o peso com controle e empurre sem perder a estabilidade."],
  ["base-incline", "Supino inclinado com halteres", "Peito", "Composto", "Halteres e banco inclinado", "Ênfase na porção superior do peitoral.", "Ajuste o banco em inclinação moderada, mantenha os punhos alinhados e empurre os halteres de forma controlada."],
  ["base-fly", "Crucifixo com halteres", "Peito", "Isolado", "Halteres e banco", "Movimento de adução dos braços com foco no peitoral.", "Com leve flexão dos cotovelos, abra os braços até uma amplitude confortável e retorne sem perder o controle."],
  ["base-pushup", "Flexão de braços", "Peito", "Composto", "Peso corporal", "Exercício de empurrar com o peso do corpo.", "Mantenha o corpo alinhado, mãos sob os ombros e desça o peito com controle. Adapte apoiando os joelhos se necessário."],
  ["base-row", "Remada curvada", "Costas", "Composto", "Barra ou halteres", "Trabalha dorsais e musculatura superior das costas.", "Incline o tronco com a coluna neutra, puxe os cotovelos em direção ao quadril e retorne lentamente."],
  ["base-pulldown", "Puxada frontal", "Costas", "Composto", "Polia alta", "Movimento de puxada vertical para dorsais.", "Sente-se com postura estável, puxe a barra à frente do peito e retorne sem balançar o tronco."],
  ["base-seated-row", "Remada baixa", "Costas", "Composto", "Polia baixa", "Fortalece costas e flexores do cotovelo.", "Mantenha o tronco firme, puxe o acessório em direção ao abdômen e volte devagar sem arredondar a coluna."],
  ["base-pull-apart", "Face pull", "Ombros", "Isolado", "Polia e corda", "Trabalha deltoide posterior e estabilizadores escapulares.", "Puxe a corda em direção ao rosto com cotovelos elevados, mantendo o movimento controlado e sem dor."],
  ["base-shoulder-press", "Desenvolvimento com halteres", "Ombros", "Composto", "Halteres", "Exercício de empurrar para ombros e tríceps.", "Sente-se com apoio, mantenha o tronco firme e eleve os halteres sem arquear excessivamente a lombar."],
  ["base-lateral-raise", "Elevação lateral", "Ombros", "Isolado", "Halteres", "Ênfase na porção lateral dos ombros.", "Com cotovelos levemente flexionados, eleve os braços lateralmente até uma altura confortável e desça com controle."],
  ["base-curl", "Rosca direta", "Bíceps", "Isolado", "Barra ou halteres", "Flexão dos cotovelos com foco nos bíceps.", "Mantenha os cotovelos próximos ao tronco, flexione sem balançar o corpo e retorne lentamente."],
  ["base-hammer", "Rosca martelo", "Bíceps", "Isolado", "Halteres", "Trabalha bíceps e musculatura do antebraço.", "Segure os halteres com as palmas voltadas uma para a outra e flexione os cotovelos mantendo os punhos neutros."],
  ["base-triceps", "Tríceps na polia", "Tríceps", "Isolado", "Polia alta", "Extensão dos cotovelos com foco no tríceps.", "Mantenha os cotovelos junto ao corpo, estenda os braços sem mover os ombros e retorne com controle."],
  ["base-plank", "Prancha", "Core", "Isométrico", "Peso corporal", "Exercício isométrico de estabilidade do tronco.", "Apoie antebraços e pontas dos pés, mantenha o corpo alinhado e respire normalmente. Encerre se perder a postura."],
  ["base-dead-bug", "Dead bug", "Core", "Controle motor", "Peso corporal", "Treina controle do tronco e coordenação.", "Deitado, mantenha a lombar confortável no chão e estenda braço e perna opostos alternadamente, sem prender a respiração."],
  ["base-bridge", "Elevação pélvica", "Glúteos", "Composto", "Peso corporal ou carga", "Extensão de quadril com foco em glúteos.", "Deitado com joelhos flexionados, eleve o quadril até alinhar tronco e coxas e retorne sem hiperestender a lombar."],
  ["base-lat-pulldown", "Pullover na polia", "Costas", "Isolado", "Polia alta", "Movimento de extensão dos ombros com foco em dorsais.", "Com os braços levemente flexionados, leve a barra em direção às coxas e retorne mantendo o tronco estável."],
];

async function seed() {
  for (const [id, name, muscleGroup, type, equipment, description, instructions] of exercises) {
    await prisma.exercise.upsert({
      where: { id },
      create: {
        id, name, muscleGroup, type, equipment, description, instructions,
        level: "Iniciante", modality: "Musculação", createdById: null,
      },
      update: { name, muscleGroup, type, equipment, description, instructions },
    });
  }
  console.log(`Biblioteca informativa inicializada: ${exercises.length} exercícios. Nenhuma conta ou atividade foi criada.`);
}

seed().catch((error: unknown) => {
  console.error("Falha ao carregar a biblioteca de exercícios.", error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
