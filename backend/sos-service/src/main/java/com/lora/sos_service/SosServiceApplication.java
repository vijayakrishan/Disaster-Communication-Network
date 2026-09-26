package com.lora.sos_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
@SpringBootApplication
public class SosServiceApplication {

	public static void main(String[] args) {

		SpringApplication.run(
				SosServiceApplication.class,
				args
		);
	}

}