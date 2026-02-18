package com.clinicrv.controller;

import com.clinicrv.model.Horario;
import com.clinicrv.repository.HorarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@CrossOrigin(origins = "*")
public class HorarioController {

    private final HorarioRepository horarioRepository;

    public HorarioController(HorarioRepository horarioRepository) {
        this.horarioRepository = horarioRepository;
    }

    @PostMapping
    public Horario crearHorario(@RequestBody Horario horario) {
        return horarioRepository.save(horario);
    }

    @GetMapping
    public List<Horario> listarHorarios() {
        return horarioRepository.findAll();
    }
}