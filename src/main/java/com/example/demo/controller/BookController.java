package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Book;
import com.example.demo.service.BookService;

@RestController
@RequestMapping("/books")
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    // GET ALL BOOKS
    @GetMapping
    public List<Book> getBooks() {
        return service.getAllBooks();
    }

    // GET LATEST BOOK
    @GetMapping("/latest")
    public Book getLatestBook() {
        return service.getLatestBook();
    }

    // GET BOOK BY ID
    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return service.getBookById(id);
    }

    // GET LATEST BOOK PER AUTHOR
    @GetMapping("/latest-by-author")
    public List<Book> getLatestBookPerAuthor() {
        return service.getLatestBookPerAuthor();
    }

    // GET BOOK WITH MINIMUM ID
    @GetMapping("/minimum")
    public Book getBookWithMinimumId() {
        return service.getBookWithMinimumId();
    }

    // ADD BOOK
    @PostMapping
    public Book addBook(@RequestBody Book book) {
        return service.addBook(book);
    }

    // UPDATE BOOK
    @PutMapping("/{id}")
    public Book updateBook(
            @PathVariable Long id,
            @RequestBody Book book) {

        return service.updateBook(id, book);
    }

    // DELETE BOOK
    @DeleteMapping("/{id}")
    public String deleteBook(@PathVariable Long id) {

        service.deleteBook(id);

        return "Book deleted successfully";
    }

    // GET BORROWED BOOKS
    @GetMapping("/borrowed")
    public List<Book> getBorrowedBooks() {
        return service.getBorrowedBooks();
    }
}