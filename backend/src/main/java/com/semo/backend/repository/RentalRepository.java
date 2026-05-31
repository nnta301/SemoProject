package com.semo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.semo.backend.entity.Rental;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Integer> {
    Rental findByUserIdAndStatus(Integer userId, String status);
}