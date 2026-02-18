package com.clinicrv.repository;
import com.clinicrv.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    @Query("SELECT c.hora FROM Cita c WHERE c.fecha = :fecha AND c.estado != 'CANCELADA'")
    List<String> findHorasOcupadas(@Param("fecha") String fecha);

    boolean existsByFechaAndHoraAndEstado(String fecha, String hora, String estado);
}

