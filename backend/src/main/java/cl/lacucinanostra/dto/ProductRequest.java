package cl.lacucinanostra.dto;
import jakarta.validation.constraints.*; import java.math.BigDecimal; import java.util.List;
public record ProductRequest(
 @NotBlank @Size(max=100) String nombre, @NotBlank @Size(max=40) String categoria,
 @NotNull String ingredientes, @NotNull @DecimalMin("0.0") BigDecimal precio,
 String imagen, @DecimalMin("0.0") BigDecimal precioOferta, String descripcion, String porcion,
 @Min(0) Integer tiempo, @Min(0) Integer calorias, List<String> alergenos, List<String> etiquetas,
 @NotNull @Min(0) Integer stock) {}
