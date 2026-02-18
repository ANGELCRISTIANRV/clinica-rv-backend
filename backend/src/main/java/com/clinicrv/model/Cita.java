package com.clinicrv.model;

import jakarta.persistence.*;

@Entity
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombrePaciente;
    private String telefono;
    private String fecha;
    private String hora;
    private String estado = "PENDIENTE";

    public Long getId() {
        return id;
    }

    public String getNombrePaciente() {
        return nombrePaciente;
    }

    public void setNombrePaciente(String nombrePaciente) {
        this.nombrePaciente = nombrePaciente;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getEstado() {
    return estado;
    }

public void setEstado(String estado) {
    this.estado = estado;
    }
 
    // Dentro de la clase Cita.java
private String diagnostico; // Campo para las notas médicas

// Añade el Getter
public String getDiagnostico() {
    return diagnostico;
}

// Añade el Setter
public void setDiagnostico(String diagnostico) {
    this.diagnostico = diagnostico;
}

}