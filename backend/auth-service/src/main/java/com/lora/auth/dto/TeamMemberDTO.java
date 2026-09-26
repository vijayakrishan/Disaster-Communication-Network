package com.lora.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberDTO {

    private String workerId;

    private String memberStatus;

    private LocalDateTime joinedAt;
}