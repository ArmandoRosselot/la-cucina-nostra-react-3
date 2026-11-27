package cl.lacucinanostra.controller;
import cl.lacucinanostra.dto.ProductRequest; import cl.lacucinanostra.model.Product; import cl.lacucinanostra.service.ProductService;
import jakarta.validation.Valid; import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/products") @CrossOrigin(origins="${app.cors.allowed-origins:http://localhost:5173}")
public class ProductController {
 private final ProductService service; public ProductController(ProductService service){this.service=service;}
 @GetMapping public List<Product> listar(){return service.listar();}
 @GetMapping("/{id}") public Product buscar(@PathVariable Long id){return service.buscar(id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public Product crear(@Valid @RequestBody ProductRequest r){return service.crear(r);}
 @PutMapping("/{id}") public Product actualizar(@PathVariable Long id,@Valid @RequestBody ProductRequest r){return service.actualizar(id,r);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void eliminar(@PathVariable Long id){service.eliminar(id);}
}
