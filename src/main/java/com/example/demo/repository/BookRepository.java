package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.entity.Book;

public interface BookRepository extends JpaRepository<Book, Long> {

    @Query(value = "SELECT * FROM book WHERE id = (SELECT MIN(id) FROM book)", nativeQuery = true)
    Book getBookUsingSubquery();

    @Query(value = "SELECT * FROM book WHERE id = (SELECT MAX(id) FROM book)", nativeQuery = true)
    Book findBookWithHighestId();

    @Query(value = "SELECT b.* FROM book b JOIN (SELECT author, MAX(id) AS max_id FROM book GROUP BY author) s ON b.id = s.max_id", nativeQuery = true)
    List<Book> findLatestBookPerAuthor();

    @Query(value = "SELECT * FROM book WHERE id = (SELECT MIN(id) FROM book)", nativeQuery = true)
    Book findBookWithMinimumId();

    @Query(value = "SELECT b.* FROM book b INNER JOIN borrow_record br ON b.id = br.book_id WHERE br.member_id = (SELECT MIN(id) FROM member)", nativeQuery = true)
    List<Book> getBooksUsingJoinAndSubquery();

    @Query(value = "SELECT b.* FROM book b LEFT JOIN borrow_record br ON b.id = br.book_id", nativeQuery = true)
    List<Book> getBooksUsingLeftJoin();

    @Query(value = "SELECT m.name FROM member m INNER JOIN borrow_record br ON m.id = br.member_id", nativeQuery = true)
    List<String> getBorrowerNames();

    @Query(value = "SELECT b.* FROM book b INNER JOIN borrow_record br ON b.id = br.book_id", nativeQuery = true)
    List<Book> getBorrowedBooks();
}