import { GameProject } from '../types';

export function getExportHTML(project: GameProject): string {
  const json = JSON.stringify(project);
  const title = project.settings.title;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title></head><body><canvas id="c"></canvas><script>const p=${json};</script></body></html>`;
}
