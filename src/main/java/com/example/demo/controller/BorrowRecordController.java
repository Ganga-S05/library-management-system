
package com.example.demo.controller;

import com.example.demo.entity.BorrowRecord;
import com.example.demo.service.BorrowRecordService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/borrow-records")
public class BorrowRecordController {

    private final BorrowRecordService service;

    public BorrowRecordController(BorrowRecordService service) {
        this.service = service;
    }

    // Get all borrow records
    @GetMapping
    public List<BorrowRecord> getAllRecords() {
        return service.getAllRecords();
    }

    // Get one borrow record by ID
    @GetMapping("/{id}")
    public BorrowRecord getRecordById(@PathVariable Long id) {
        return service.getRecordById(id);
    }

    // Create a borrow record
    @PostMapping
    public BorrowRecord addRecord(@RequestBody BorrowRecord record) {
        return service.addRecord(record);
    }

    // Mark a book as returned
    @PutMapping("/{id}/return")
    public BorrowRecord markBookAsReturned(@PathVariable Long id) {

        BorrowRecord record = service.getRecordById(id);

        if (record == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Borrow record not found"
            );
        }

        record.setReturned(true);

        return service.addRecord(record);
    }

    // Delete a borrow record
    @DeleteMapping("/{id}")
    public String deleteRecord(@PathVariable Long id) {
        service.deleteRecord(id);
        return "Borrow record deleted successfully";
    }
}