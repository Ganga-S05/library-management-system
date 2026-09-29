package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.Book;
import com.example.demo.repository.BookRepository;

@Service
public class BookService {

    private final BookRepository repository;

    public BookService(BookRepository repository) {
        this.repository = repository;
    }

    public List<Book> getAllBooks() {
        return repository.findAll();
    }

    public Book getBookById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Book getLatestBook() {
        return repository.findBookWithHighestId();
    }

    public List<Book> getLatestBookPerAuthor() {
        return repository.findLatestBookPerAuthor();
    }

    public Book getBookWithMinimumId() {
        return repository.findBookWithMinimumId();
    }

    public Book addBook(Book book) {
        return repository.save(book);
    }

    public Book updateBook(Long id, Book book) {
        Book existingBook = repository.findById(id).orElse(null);

        if (existingBook != null) {
            existingBook.setName(book.getName());
            existingBook.setAuthor(book.getAuthor());
            return repository.save(existingBook);
        }

        return null;
    }

    public void deleteBook(Long id) {
        repository.deleteById(id);
    }
    public List<Book> getBorrowedBooks() {
        return repository.getBorrowedBooks();
    }
}