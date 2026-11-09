/** Дочерний узел, который можно передать в `el`. */
export type Child = Node | string;

/** Пространство имён SVG. */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Создаёт DOM-элемент.
 *
 * Атрибуты выставляются через `setAttribute`, дети добавляются через `append`.
 * Текст передаётся строкой и попадает в текстовый узел, поэтому `innerHTML`
 * не используется нигде в приложении.
 *
 * @param tag - имя тега
 * @param attributes - атрибуты элемента
 * @param children - дочерние узлы или текст; `null` игнорируется
 * @returns созданный элемент
 *
 * @example
 * el('button', { class: 'primary', type: 'button' }, ['Start']);
 */
export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Readonly<Record<string, string>> = {},
  children: readonly (Child | null)[] = [],
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);

  Object.entries(attributes).forEach(([name, value]) => {
    node.setAttribute(name, value);
  });

  node.append(...children.filter((child): child is Child => child !== null));

  return node;
};

/**
 * Создаёт SVG-иконку из набора контуров.
 *
 * Иконка декоративная: `aria-hidden` скрывает её от скринридеров, а смысл
 * передаётся через `aria-label` кнопки.
 *
 * @param paths - значения атрибута `d` для каждого контура
 * @param size - сторона иконки в пикселях
 * @returns готовый SVG-элемент
 */
export const icon = (paths: readonly string[], size = 20): SVGElement => {
  const svg = document.createElementNS(SVG_NS, 'svg');

  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  paths.forEach((d) => {
    const path = document.createElementNS(SVG_NS, 'path');

    path.setAttribute('d', d);
    svg.append(path);
  });

  return svg;
};
