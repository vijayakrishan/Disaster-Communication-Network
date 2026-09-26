package com.lora.auth.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class TeamDataSourceConfig {

    // =====================================================
    // AUTH DATABASE
    // =====================================================

    @Bean(name = "authDataSource")
    @Primary
    public DataSource authDataSource() {

        return DataSourceBuilder
                .create()
                .url(
                        "jdbc:mysql://localhost:3306/auth_db" +
                                "?useSSL=false" +
                                "&serverTimezone=Asia/Kolkata" +
                                "&allowPublicKeyRetrieval=true"
                )
                .username("root")
                .password("root")
                .driverClassName("com.mysql.cj.jdbc.Driver")
                .build();
    }


    // =====================================================
    // TEAM DATABASE
    // =====================================================

    @Bean(name = "teamDataSource")
    public DataSource teamDataSource() {

        return DataSourceBuilder
                .create()
                .url(
                        "jdbc:mysql://localhost:3306/team_db" +
                                "?useSSL=false" +
                                "&serverTimezone=Asia/Kolkata" +
                                "&allowPublicKeyRetrieval=true"
                )
                .username("root")
                .password("root")
                .driverClassName("com.mysql.cj.jdbc.Driver")
                .build();
    }


    // =====================================================
    // TEAM JDBC TEMPLATE
    // =====================================================

    @Bean(name = "teamJdbcTemplate")
    public JdbcTemplate teamJdbcTemplate(
            @Qualifier("teamDataSource")
            DataSource dataSource) {

        return new JdbcTemplate(dataSource);
    }
}