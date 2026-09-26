package com.lora.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {

    private String id;

    private String name;

    private String leader;

    private String location;

    private String contactNumber;

    private String status;

    private List<TeamMemberDTO> members;
}