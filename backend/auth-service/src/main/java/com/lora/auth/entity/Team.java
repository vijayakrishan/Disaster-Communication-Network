package com.lora.auth.entity;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    private String id;
    private String name;
    private String leaderName;
    private String frequencySector;
    private String contactNumber;
    private String operationalState;
    private Long memberCount;

}