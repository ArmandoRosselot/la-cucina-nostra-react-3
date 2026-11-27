package cl.lacucinanostra.config;
import io.swagger.v3.oas.models.OpenAPI; import io.swagger.v3.oas.models.info.Info; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
@Configuration public class OpenApiConfig {
 @Bean public OpenAPI laCucinaOpenAPI(){return new OpenAPI().info(new Info().title("La Cucina Nostra API").version("1.0.0").description("API REST para administrar el catálogo de La Cucina Nostra."));}
}
