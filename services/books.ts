const BASE_URL = 'https://project-gutenberg-free-books-api1.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY!;

const HEADERS: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-rapidapi-host': 'project-gutenberg-free-books-api1.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY,
};

const get = async (url: string) => {
    const res = await fetch(url, { method: 'GET', headers: HEADERS });
    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`[${res.status}] ${body}`);
    }
    return res.json();
};

export const BooksService = {
    // home + library default
    getBooks: (page = 1) => get(`${BASE_URL}/books?page=${page}&page_size=32`),
    getNext: (nextUrl: string) => get(nextUrl),
    getBookById: (id: number) => get(`${BASE_URL}/books/${id}`),
    getBookText: (id: number) => get(`${BASE_URL}/books/${id}/text?cleaning_mode=super`),

    // ✅ search by keyword
    searchBooks: (q: string, page = 1) =>
        get(`${BASE_URL}/books?q=${encodeURIComponent(q)}&page=${page}&page_size=32`),

    // ✅ filter by subject keyword
    getBySubject: (subject: string, page = 1) =>
        get(`${BASE_URL}/books?subject=${encodeURIComponent(subject)}&page=${page}&page_size=32`),
};

// ✅ Fixed categories — curated so they always return results
export const BOOK_CATEGORIES = [
    { id: 'all', label: 'الكل', query: '' },
    { id: 'finance', label: 'المال', query: 'money finance' },
    { id: 'philosophy', label: 'الفلسفة', query: 'philosophy' },
    { id: 'fiction', label: 'روايات', query: 'fiction' },
    { id: 'history', label: 'التاريخ', query: 'history' },
    { id: 'science', label: 'العلوم', query: 'science' },
    { id: 'psychology', label: 'علم النفس', query: 'psychology' },
    { id: 'adventure', label: 'المغامرة', query: 'adventure' },
    { id: 'romance', label: 'الرومانسية', query: 'romance' },
    { id: 'mystery', label: 'الغموض', query: 'mystery' },
    { id: 'poetry', label: 'الشعر', query: 'poetry' },
    { id: 'religion', label: 'الدين', query: 'religion' },
];