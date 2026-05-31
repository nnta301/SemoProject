package com.semo.backend.repository;

import com.semo.backend.entity.Rental;
import com.semo.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Integer> {
    List<Rental> findByUserOrderByStartTimeDesc(User user);
}