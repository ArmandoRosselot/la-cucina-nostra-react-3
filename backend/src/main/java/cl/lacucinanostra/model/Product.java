package cl.lacucinanostra.model;
import jakarta.persistence.*;
import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter;
import java.math.BigDecimal; import java.util.ArrayList; import java.util.List;
@Getter @Setter @NoArgsConstructor @Entity @Table(name="products")
public class Product {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=100) private String nombre;
 @Column(nullable=false,length=40) private String categoria;
 @Column(nullable=false,columnDefinition="text") private String ingredientes;
 @Column(nullable=false,precision=12,scale=2) private BigDecimal precio;
 @Column(columnDefinition="text") private String imagen;
 @Column(name="precio_oferta",precision=12,scale=2) private BigDecimal precioOferta;
 @Column(columnDefinition="text") private String descripcion;
 @Column(length=100) private String porcion;
 private Integer tiempo; private Integer calorias;
 @ElementCollection @CollectionTable(name="product_allergens",joinColumns=@JoinColumn(name="product_id")) @Column(name="allergen",length=60) private List<String> alergenos=new ArrayList<>();
 @ElementCollection @CollectionTable(name="product_tags",joinColumns=@JoinColumn(name="product_id")) @Column(name="tag",length=60) private List<String> etiquetas=new ArrayList<>();
 @Column(nullable=false) private Integer stock=20;
}
