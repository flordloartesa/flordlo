// Interface para o Workbook individual
export interface Workbook {
  title: string;
  fileUrl: string;
}

// Interface para os dados do Curso
export interface CourseData {
  _id: string;
  title: string;
  slug: { current: string };
  // Adicionamos os workbooks como um array opcional
  workbooks?: Workbook[];
  // Podes adicionar aqui outros campos que já tenhas (ex: description, mainImage)
}

import { CourseData } from '../types/sanity'; // Importa a interface que criámos

// Exemplo de uma query para ir buscar um curso pelo Slug
export const GET_COURSE_QUERY = `
  *[_type == "courses" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    "workbooks": workbooks[]{
      title,
      "fileUrl": file.asset->url
    }
  }
`;