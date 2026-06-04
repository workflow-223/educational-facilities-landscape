package com.jade.educational_facilities.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class HealthControllerTest {

    private HealthController healthController;

    @BeforeEach
    public void setUp() {
        healthController = new HealthController();
    }

    @Test
    public void testHealth_returnsOK() {
        String result = healthController.health();
        assertNotNull(result);
        assertEquals("OK", result);
    }

    @Test
    public void testHealth_returnsString() {
        String result = healthController.health();
        assertEquals("OK", result);
    }
}