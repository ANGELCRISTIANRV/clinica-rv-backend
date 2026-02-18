package com.clinicrv.controller;
import com.clinicrv.model.Cita;
import com.clinicrv.repository.CitaRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*")
public class CitaController {

    private final CitaRepository citaRepository;

    public CitaController(CitaRepository citaRepository) {
        this.citaRepository = citaRepository;
    }

  @PostMapping
public Cita crearCita(@RequestBody Cita cita) {

    boolean ocupado = citaRepository
        .existsByFechaAndHoraAndEstado(cita.getFecha(), cita.getHora(), "CONFIRMADA");

    if (ocupado) {
        throw new RuntimeException("Horario no disponible");
    }

    cita.setEstado("PENDIENTE");
    return citaRepository.save(cita);
}

    @GetMapping
    public List<Cita> listarCitas() {
        return citaRepository.findAll();
    }

@PutMapping("/{id}/confirmar")
public ResponseEntity<?> confirmar(@PathVariable Long id) {

    Cita cita = citaRepository.findById(id).orElse(null);

    if (cita == null) {
        return ResponseEntity.notFound().build();
    }

    boolean ocupado = citaRepository
        .existsByFechaAndHoraAndEstado(
            cita.getFecha(),
            cita.getHora(),
            "CONFIRMADA"
        );

    if (ocupado) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body("Horario ocupado");
    }

    cita.setEstado("CONFIRMADA");
    citaRepository.save(cita);

    return ResponseEntity.ok(cita);
}
   
@PutMapping("/{id}/cancelar")
public ResponseEntity<?> cancelar(@PathVariable Long id) {

    Cita cita = citaRepository.findById(id).orElse(null);

    if (cita == null) {
        return ResponseEntity.notFound().build();
    }

    cita.setEstado("CANCELADA");
    citaRepository.save(cita);

    return ResponseEntity.ok(cita);
}

@DeleteMapping("/{id}")
public ResponseEntity<?> eliminarCita(@PathVariable Long id) {

    if (!citaRepository.existsById(id)) {
        return ResponseEntity.notFound().build();
    }

    citaRepository.deleteById(id);
    return ResponseEntity.ok().build();
}
@GetMapping("/ocupadas")
public List<String> obtenerHorasOcupadas(@RequestParam String fecha) {
    // Usamos el repositorio para traer las horas de citas CONFIRMADAS o PENDIENTES
    // Para que no se puedan agendar dos veces la misma hora
    return citaRepository.findHorasOcupadas(fecha);
}

@PutMapping("/{id}/diagnostico")
public ResponseEntity<?> guardarDiagnostico(@PathVariable Long id, @RequestBody String diagnostico) {
    Cita cita = citaRepository.findById(id).orElse(null);
    if (cita == null) {
        return ResponseEntity.notFound().build();
    }
    
    cita.setDiagnostico(diagnostico); // Guardamos la nota médica
    citaRepository.save(cita);
    return ResponseEntity.ok(cita);
}

}