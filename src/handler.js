// Memuat seluruh fungsi-fungsi handler yang digunakan pada berkas routes.

const { nanoid } = require('nanoid'); // Mengimpor fungsi nanoid dari package nanoid untuk membuat ID unik.
let books = require('./books'); // Mengimpor array books dari file lokal 'books.js' yang akan digunakan untuk menyimpan catatan.

const addBookHandler = (request, h) => {
  // Mendapatkan body request dari client menggunakan payload Hapi.js.
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  // Mendapatkan ID unik menggunakan library nanoid dengan panjang 20 karakter.
  const id = nanoid(20);

  // Mendapatkan timestamp untuk insertedAt dan updatedAt.
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  let finished = false;
  if (pageCount === readPage) {
    finished = true;
  } else {
    finished = false;
  }

  // Membuat objek catatan baru dengan informasi yang didapat dari request.
  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
    });
    response.code(400);
    return response;
  } else if (!name) {
    // Cek apakah 'name' ada dan tidak kosong
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  } else {
    // Mengecek apakah catatan berhasil ditambahkan ke array books.
    books.push(newBook);
    const isSuccess = books.filter((book) => book.id === id).length > 0;
    if (isSuccess) {
    // Menambahkan catatan baru ke dalam array books.
      // Jika berhasil, kirimkan respon sukses dengan kode status 201 (inserted).
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      });
      response.code(201);
      return response;
    }

    // Jika gagal, kirimkan respon gagal dengan kode status 500 (Internal Server Error).
    const response = h.response({
      status: 'fail',
      message: 'Buku gagal ditambahkan',
    });
    response.code(500);
    return response;
  }
};

// Handler untuk mendapatkan semua buku.
const getAllBooksHandler = (request, h) => {
  // Mendapatkan query parameters dari request.
  const { name, reading, finished } = request.query;

  // Memulai filter dari semua buku.
  let filteredBooks = books;

  // Filter berdasarkan nama (case insensitive).
  if (name) {
    const lowerCaseName = name.toLowerCase();
    filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(lowerCaseName)
    );
  }

  // Filter berdasarkan status membaca (reading).
  if (reading) {
    const isReading = reading === '1';
    filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
  }

  // Filter berdasarkan status selesai dibaca (finished).
  if (finished) {
    const isFinished = finished === '1';
    filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
  }

  // Mengembalikan hanya id, name, dan publisher dari buku-buku yang sudah difilter.
  const responseBooks = filteredBooks.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  const response = h.response({
    status: 'success',
    data: {
      books: responseBooks,
    },
  });
  response.code(200);
  return response;
};


const getBookByIdHandler = (request, h) => {
  // Mengambil id catatan dari parameter URL.
  const { id } = request.params;

  books = require('./books');
  // Mencari catatan yang memiliki id yang sama dengan id dari parameter.
  let book = books.filter((n) => n.id === id)[0];

  if (book) {
    book = books.find((book) => book.id === id && book.finished === true);
    if (book) {
      const response = h.response({
        status: 'success',
        data: {
          book,
        },
      });
      response.code(200);
      return response;
    } else {
      book = books.filter((n) => n.id === id)[0];
      const response = h.response({
        status: 'success',
        data: {
          book,
        },
      });
      response.code(200);
      return response;
    }
  } else {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  };
};

const editBookByIdHandler = (request, h) => {
  // Mengambil id catatan dari parameter URL.
  const { id } = request.params;

  books = require('./books');
  // Mendapatkan data baru dari body request.
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  const updatedAt = new Date().toISOString(); // Mendapatkan timestamp untuk waktu diperbarui.

  // Mencari indeks catatan yang memiliki id sesuai.
  const index = books.findIndex((note) => note.id === id);

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
    });
    response.code(400);
    return response;
  } else if (!name) {
    // Cek apakah 'name' ada dan tidak kosong
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  } else if (index !== -1) {
    // Jika catatan ditemukan, perbarui isinya dengan data baru.
    books[index] = {
      ...books[index], // Menyebarkan seluruh properti dari objek notes[index] yang ada saat ini.
      name,           // Mengubah atau menambahkan properti title dengan nilai yang baru.
      year,            // Mengubah atau menambahkan properti tags dengan nilai yang baru.
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,            // Mengubah atau menambahkan properti body dengan nilai yang baru.
      updatedAt,       // Menambahkan atau memperbarui waktu diperbarui.
    };

    // Kirimkan respon sukses setelah buku diperbarui.
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    return response;
  } else {
  // Jika catatan tidak ditemukan, kirimkan respon gagal dengan kode status 404.
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  };
};

const deleteBookByIdHandler = (request, h) => {
  // Mengambil id catatan dari parameter URL.
  const { id } = request.params;

  // Mencari indeks catatan yang memiliki id sesuai.
  const index = books.findIndex((note) => note.id === id);

  if (index !== -1) {
    // Jika catatan ditemukan, hapus catatan tersebut dari array.
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  } else {
  // Jika catatan tidak ditemukan, kirimkan respon gagal dengan kode status 404.
    const response = h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan'
    });
    response.code(404);
    return response;
  };
};

// Mengekspor semua handler untuk digunakan di file lain.
module.exports = { addBookHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler };