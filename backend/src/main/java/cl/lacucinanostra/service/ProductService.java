package cl.lacucinanostra.service;
import cl.lacucinanostra.dto.ProductRequest; import cl.lacucinanostra.model.Product; import cl.lacucinanostra.repository.ProductRepository;
import org.springframework.http.HttpStatus; import org.springframework.stereotype.Service; import org.springframework.web.server.ResponseStatusException; import java.util.List;
@Service public class ProductService {
 private final ProductRepository repository; public ProductService(ProductRepository repository){this.repository=repository;}
 public List<Product> listar(){return repository.findAll();}
 public Product buscar(Long id){return repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto no encontrado"));}
 public Product crear(ProductRequest r){Product p=new Product(); aplicar(p,r); return repository.save(p);}
 public Product actualizar(Long id,ProductRequest r){Product p=buscar(id); aplicar(p,r); return repository.save(p);}
 public void eliminar(Long id){repository.delete(buscar(id));}
 private void aplicar(Product p,ProductRequest r){p.setNombre(r.nombre().trim());p.setCategoria(r.categoria().trim());p.setIngredientes(r.ingredientes());p.setPrecio(r.precio());p.setImagen(r.imagen());p.setPrecioOferta(r.precioOferta());p.setDescripcion(r.descripcion());p.setPorcion(r.porcion());p.setTiempo(r.tiempo());p.setCalorias(r.calorias());p.setAlergenos(r.alergenos()==null?List.of():r.alergenos());p.setEtiquetas(r.etiquetas()==null?List.of():r.etiquetas());p.setStock(r.stock());}
}
