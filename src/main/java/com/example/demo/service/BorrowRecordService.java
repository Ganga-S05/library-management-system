package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.entity.BorrowRecord;
import com.example.demo.repository.BorrowRecordRepository;

@Service
public class BorrowRecordService {

    private final BorrowRecordRepository repository;

    public BorrowRecordService(BorrowRecordRepository repository) {
        this.repository = repository;
    }

    public List<BorrowRecord> getAllRecords() {
        return repository.findAll();
    }

    public BorrowRecord getRecordById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public BorrowRecord addRecord(BorrowRecord record) {
        return repository.save(record);
    }

    public void deleteRecord(Long id) {
        repository.deleteById(id);
    }
}