package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.entity.Member;
import com.example.demo.repository.MemberRepository;

@Service
public class MemberService {

    private final MemberRepository repository;

    public MemberService(MemberRepository repository) {
        this.repository = repository;
    }

    public List<Member> getAllMembers() {
        return repository.findAll();
    }

    public Member getMemberById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Member addMember(Member member) {
        return repository.save(member);
    }

    public Member updateMember(Long id, Member member) {
        Member existing = repository.findById(id).orElse(null);

        if (existing != null) {
            existing.setName(member.getName());
            existing.setEmail(member.getEmail());
            existing.setPhone(member.getPhone());
            return repository.save(existing);
        }

        return null;
    }

    public void deleteMember(Long id) {
        repository.deleteById(id);
    }
}