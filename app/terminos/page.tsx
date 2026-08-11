import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-[family-name:var(--font-work-sans)]">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-montserrat)]">
          TÉRMINOS Y CONDICIONES DE USO DEL SITIO WEB
        </h1>
        <p className="text-xl text-slate-400 mb-2 font-bold">CONSTRUCTORA MAZA QUIROZ E.I.R.L.</p>
        <p className="text-sm text-slate-500 mb-12">Última actualización: 11 de agosto de 2026</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. IDENTIFICACIÓN DEL TITULAR DEL SITIO WEB</h2>
            <p className="mb-4">Los presentes Términos y Condiciones regulan el acceso y uso del sitio web de <strong>CONSTRUCTORA MAZA QUIROZ E.I.R.L.</strong>, en adelante, <strong>“LA EMPRESA”</strong>.</p>
            <h3 className="text-lg font-bold text-white mb-2">Datos de identificación</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Razón social:</strong> CONSTRUCTORA MAZA QUIROZ E.I.R.L.</li>
              <li><strong>RUC:</strong> 20607520357</li>
              <li><strong>Domicilio:</strong> Jr. Iquitos N.° 149</li>
              <li><strong>Correo electrónico:</strong> <a href="mailto:mazaquiroz24@gmail.com" className="text-sky-400 hover:underline">mazaquiroz24@gmail.com</a></li>
              <li><strong>Teléfono:</strong> 985863448</li>
              <li><strong>Sitio web:</strong> <a href="https://techo-propio-sistema.vercel.app/" className="text-sky-400 hover:underline">https://techo-propio-sistema.vercel.app/</a></li>
            </ul>
            <p>LA EMPRESA desarrolla sus actividades bajo la legislación de la República del Perú.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. OBJETO DEL SITIO WEB</h2>
            <p className="mb-2">El sitio web tiene carácter principalmente <strong>informativo y corporativo</strong>.</p>
            <p className="mb-2">Su finalidad es proporcionar información relacionada con CONSTRUCTORA MAZA QUIROZ E.I.R.L., sus actividades, servicios, proyectos, experiencia, información institucional y demás contenidos relacionados con la actividad empresarial de LA EMPRESA.</p>
            <p className="mb-2">La información publicada en el sitio web busca permitir que los visitantes conozcan mejor a LA EMPRESA y sus actividades.</p>
            <p>El sitio web no constituye, por sí mismo, un contrato de prestación de servicios, contrato de obra, compraventa, compromiso de ejecución de proyecto ni obligación contractual, salvo que expresamente se indique lo contrario mediante un documento contractual válido.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. ACEPTACIÓN DE LOS TÉRMINOS</h2>
            <p className="mb-2">El acceso, navegación y utilización del sitio web implica que el visitante conoce y acepta los presentes Términos y Condiciones en aquello que resulte aplicable.</p>
            <p className="mb-2">Si el visitante no está de acuerdo con estos términos, deberá abstenerse de utilizar el sitio web.</p>
            <p>Estos Términos deberán interpretarse conjuntamente con las demás políticas y documentos legales publicados por LA EMPRESA.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. NATURALEZA INFORMATIVA DEL SITIO</h2>
            <p className="mb-2">La información publicada en el sitio web tiene una finalidad principalmente informativa.</p>
            <p className="mb-2">La existencia de información sobre determinados servicios, proyectos, materiales, diseños, viviendas, construcciones o soluciones no significa necesariamente que estos se encuentren disponibles en todo momento ni que sus características, precios o condiciones sean definitivos.</p>
            <p>Las condiciones concretas de cualquier eventual servicio o proyecto serán determinadas mediante la correspondiente propuesta, cotización, contrato, orden de servicio, expediente técnico u otro documento aplicable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. INFORMACIÓN SOBRE LOS SERVICIOS</h2>
            <p className="mb-2">LA EMPRESA procura que la información publicada sobre sus servicios sea clara y razonablemente actualizada.</p>
            <p className="mb-2">Sin embargo, las características de los servicios pueden variar debido a factores técnicos, comerciales, normativos, disponibilidad de materiales, condiciones del proyecto u otras circunstancias.</p>
            <p>Por ello, la información disponible en el sitio web no sustituye una evaluación técnica o comercial específica.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. PROYECTOS DE CONSTRUCCIÓN</h2>
            <p className="mb-2">Las características, costos, plazos y condiciones de un proyecto de construcción pueden depender de diferentes factores, entre ellos:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-1 md:grid-cols-2">
              <li>Características y condiciones del terreno.</li>
              <li>Ubicación del proyecto.</li>
              <li>Estudios técnicos.</li>
              <li>Diseño arquitectónico.</li>
              <li>Expediente técnico.</li>
              <li>Metrados.</li>
              <li>Especificaciones técnicas.</li>
              <li>Disponibilidad de materiales.</li>
              <li>Disponibilidad de mano de obra.</li>
              <li>Permisos y licencias.</li>
              <li>Normativa municipal.</li>
              <li>Modificaciones solicitadas por el cliente.</li>
              <li>Condiciones climáticas.</li>
              <li>Disponibilidad de proveedores.</li>
              <li>Variaciones de precios.</li>
              <li>Circunstancias de fuerza mayor o caso fortuito.</li>
            </ul>
            <p>Por ello, la información presentada en el sitio web no deberá interpretarse como una garantía de que un determinado proyecto podrá ejecutarse bajo condiciones idénticas a las mostradas en la página.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. IMÁGENES, RENDERS Y REPRESENTACIONES</h2>
            <p className="mb-2">Las fotografías, renders, diseños, ilustraciones, planos, modelos tridimensionales, imágenes de proyectos y demás representaciones visuales publicadas en el sitio web podrán utilizarse con fines informativos y comerciales.</p>
            <p className="mb-2">Cuando corresponda, dichas imágenes podrán tener carácter referencial.</p>
            <p>La apariencia final de una obra, vivienda, proyecto, material o espacio puede variar respecto de una representación gráfica debido a factores técnicos, materiales, iluminación, ubicación, diseño definitivo o modificaciones realizadas durante la ejecución.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. PRECIOS Y COTIZACIONES</h2>
            <p className="mb-2">Cuando el sitio web muestre precios, valores referenciales, promociones o estimaciones, estos estarán sujetos a las condiciones indicadas en cada caso.</p>
            <p className="mb-2">La publicación de un precio en el sitio web no necesariamente constituye una cotización contractual.</p>
            <p className="mb-2">Una cotización o propuesta definitiva podrá depender de una evaluación previa del proyecto, sus características, materiales, dimensiones, ubicación, requerimientos técnicos y demás factores relevantes.</p>
            <p>Las condiciones definitivas de contratación serán aquellas establecidas en el documento comercial o contractual correspondiente.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. DISPONIBILIDAD DE SERVICIOS</h2>
            <p className="mb-2">La publicación de un determinado servicio en el sitio web no garantiza que este se encuentre disponible en todo momento.</p>
            <p className="mb-2">La disponibilidad dependerá de factores como:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-1 md:grid-cols-2">
              <li>Capacidad operativa.</li>
              <li>Ubicación del proyecto.</li>
              <li>Disponibilidad de personal.</li>
              <li>Disponibilidad de materiales.</li>
              <li>Condiciones técnicas.</li>
              <li>Programación de obras.</li>
              <li>Condiciones comerciales.</li>
              <li>Requerimientos legales o administrativos.</li>
            </ul>
            <p>LA EMPRESA podrá actualizar la información publicada cuando resulte necesario.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. USO PERMITIDO DEL SITIO WEB</h2>
            <p className="mb-2">El visitante deberá utilizar el sitio web de manera lícita, responsable y conforme a la legislación peruana.</p>
            <p className="mb-2">Está permitido:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Navegar por el sitio.</li>
              <li>Consultar la información publicada.</li>
              <li>Compartir enlaces al sitio web.</li>
              <li>Consultar información sobre LA EMPRESA.</li>
              <li>Utilizar la información con fines personales o informativos dentro de los límites permitidos por la legislación.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. USOS PROHIBIDOS</h2>
            <p className="mb-2">Está prohibido utilizar el sitio web para:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Realizar actividades ilícitas.</li>
              <li>Intentar acceder sin autorización a sistemas o servidores.</li>
              <li>Introducir virus, malware o código malicioso.</li>
              <li>Interferir con el funcionamiento del sitio.</li>
              <li>Realizar ataques informáticos.</li>
              <li>Intentar vulnerar mecanismos de seguridad.</li>
              <li>Suplantar la identidad de LA EMPRESA.</li>
              <li>Utilizar la identidad de terceros de manera fraudulenta.</li>
              <li>Copiar contenidos protegidos sin autorización.</li>
              <li>Utilizar contenidos de LA EMPRESA para actividades ilícitas.</li>
              <li>Realizar ingeniería inversa sobre componentes del sitio cuando esté prohibida por la legislación aplicable.</li>
              <li>Utilizar mecanismos automatizados para extraer información del sitio de manera abusiva o no autorizada.</li>
              <li>Realizar cualquier actividad que pueda perjudicar a LA EMPRESA o a terceros.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. PROPIEDAD INTELECTUAL</h2>
            <p className="mb-2">Todos los elementos del sitio web que sean propiedad de LA EMPRESA, o cuyo uso haya sido legítimamente autorizado a LA EMPRESA, podrán encontrarse protegidos por la legislación peruana sobre propiedad intelectual.</p>
            <p className="mb-2">Esto puede comprender, entre otros:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-1 md:grid-cols-3">
              <li>Nombre comercial.</li>
              <li>Logotipos.</li>
              <li>Marcas.</li>
              <li>Fotografías.</li>
              <li>Imágenes.</li>
              <li>Diseños.</li>
              <li>Planos.</li>
              <li>Renders.</li>
              <li>Modelos.</li>
              <li>Textos.</li>
              <li>Gráficos.</li>
              <li>Videos.</li>
              <li>Elementos audiovisuales.</li>
              <li>Diseño visual del sitio.</li>
              <li>Estructura y organización de contenidos.</li>
            </ul>
            <p className="mb-2">Ningún contenido del sitio web deberá interpretarse como una transferencia de derechos de propiedad intelectual al visitante.</p>
            <p>La reproducción, distribución, modificación, publicación, comunicación pública o explotación comercial de contenidos protegidos requerirá la autorización correspondiente, salvo que la legislación permita expresamente dicho uso.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">13. USO PERSONAL DE LOS CONTENIDOS</h2>
            <p className="mb-2">El visitante podrá consultar el contenido del sitio web para fines personales e informativos.</p>
            <p>No podrá utilizar los contenidos para crear un servicio comercial que compita directamente con LA EMPRESA mediante la reproducción no autorizada de sus contenidos, diseños, fotografías, documentos o materiales protegidos.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">14. ENLACES A SITIOS EXTERNOS</h2>
            <p className="mb-2">El sitio web puede contener enlaces hacia páginas, plataformas o servicios de terceros.</p>
            <p className="mb-2">Estos enlaces pueden incluir, entre otros:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-1 md:grid-cols-2">
              <li>Redes sociales.</li>
              <li>Plataformas de mapas.</li>
              <li>Servicios de mensajería.</li>
              <li>Sitios de proveedores.</li>
              <li>Plataformas audiovisuales.</li>
              <li>Otros sitios relacionados con LA EMPRESA.</li>
            </ul>
            <p className="mb-2">Los sitios externos se encuentran sujetos a sus propias condiciones de uso y políticas de privacidad.</p>
            <p>LA EMPRESA no controla necesariamente el contenido, funcionamiento, seguridad o políticas de dichos sitios externos.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">15. COMUNICACIONES MEDIANTE CANALES EXTERNOS</h2>
            <p className="mb-2">El sitio web puede proporcionar información que permita al visitante comunicarse con LA EMPRESA mediante teléfono, correo electrónico, WhatsApp u otros canales.</p>
            <p className="mb-2">El uso de estos canales es voluntario.</p>
            <p className="mb-2">Cuando una persona decida comunicarse con LA EMPRESA, la comunicación podrá implicar el tratamiento de información personal proporcionada voluntariamente por dicha persona.</p>
            <p className="mb-2">El tratamiento correspondiente se realizará conforme a la legislación peruana aplicable y a la <strong>Política de Privacidad</strong> de LA EMPRESA.</p>
            <p>Cuando el canal pertenezca a un tercero, como WhatsApp, también serán aplicables las condiciones y políticas de dicho proveedor.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">16. AUSENCIA DE REGISTRO DE USUARIOS</h2>
            <p className="mb-2">Actualmente, el sitio web no requiere que los visitantes:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-1 md:grid-cols-2">
              <li>Creen una cuenta.</li>
              <li>Se registren.</li>
              <li>Inicien sesión.</li>
              <li>Completen un formulario de contacto.</li>
              <li>Completen un formulario de cotización.</li>
              <li>Se suscriban a un boletín.</li>
              <li>Proporcionen datos personales para acceder al contenido público.</li>
            </ul>
            <p>El sitio funciona principalmente como una plataforma informativa y corporativa.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">17. PROTECCIÓN DE DATOS PERSONALES</h2>
            <p className="mb-2">LA EMPRESA respeta el derecho a la protección de los datos personales reconocido por la legislación peruana.</p>
            <p className="mb-2">El tratamiento de datos personales que eventualmente pueda realizarse como consecuencia de una comunicación voluntaria con LA EMPRESA se encuentra regulado por la <strong>Política de Privacidad y Protección de Datos Personales</strong> publicada en el sitio web.</p>
            <p>La Política de Privacidad puede ser consultada en: <Link href="/privacidad" className="text-sky-400 hover:underline">Aviso de Privacidad</Link></p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">18. COOKIES Y TECNOLOGÍAS SIMILARES</h2>
            <p className="mb-2">El sitio web puede utilizar cookies o tecnologías similares necesarias para su funcionamiento, seguridad, rendimiento o determinadas funcionalidades.</p>
            <p className="mb-2">El uso de estas tecnologías se encuentra sujeto a la configuración efectiva del sitio y a la legislación peruana aplicable.</p>
            <p className="mb-2">Cuando correspondan mecanismos específicos de información o consentimiento, LA EMPRESA los implementará conforme a la normativa aplicable.</p>
            <p>Para obtener información adicional sobre el tratamiento de información mediante estas tecnologías, el visitante podrá consultar la Política de Privacidad correspondiente.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">19. SEGURIDAD DEL SITIO WEB</h2>
            <p className="mb-2">LA EMPRESA adopta medidas razonables para mantener la seguridad y funcionamiento del sitio web.</p>
            <p className="mb-2">Sin embargo, ningún sistema conectado a Internet puede garantizar una seguridad absoluta.</p>
            <p className="mb-2">LA EMPRESA no puede garantizar que el sitio web permanecerá permanentemente libre de:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-1 md:grid-cols-3">
              <li>Fallas técnicas.</li>
              <li>Interrupciones.</li>
              <li>Ataques informáticos.</li>
              <li>Vulnerabilidades.</li>
              <li>Errores de software.</li>
              <li>Problemas de infraestructura.</li>
              <li>Eventos externos.</li>
            </ul>
            <p>LA EMPRESA procurará atender y solucionar los incidentes que se encuentren razonablemente bajo su control.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">20. DISPONIBILIDAD DEL SITIO</h2>
            <p className="mb-2">LA EMPRESA procura mantener disponible el sitio web de manera continua.</p>
            <p className="mb-2">No obstante, el acceso puede interrumpirse temporalmente debido a:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-1 md:grid-cols-2">
              <li>Mantenimiento.</li>
              <li>Actualizaciones.</li>
              <li>Fallas de servidores.</li>
              <li>Fallas de proveedores tecnológicos.</li>
              <li>Problemas de conectividad.</li>
              <li>Ataques informáticos.</li>
              <li>Cortes de energía.</li>
              <li>Problemas de infraestructura.</li>
              <li>Caso fortuito.</li>
              <li>Fuerza mayor.</li>
              <li>Otras circunstancias fuera del control razonable de LA EMPRESA.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">21. EXACTITUD DE LA INFORMACIÓN</h2>
            <p className="mb-2">LA EMPRESA realiza esfuerzos razonables para que la información publicada sea correcta y esté actualizada.</p>
            <p className="mb-2">Sin embargo, pueden existir errores involuntarios, omisiones, información desactualizada o diferencias entre la información publicada y las condiciones actuales.</p>
            <p>LA EMPRESA podrá corregir, modificar o actualizar cualquier contenido cuando resulte necesario.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">22. RESPONSABILIDAD DEL VISITANTE</h2>
            <p className="mb-2">El visitante será responsable del uso que realice del sitio web y de cualquier actividad que efectúe contraviniendo estos Términos o la legislación aplicable.</p>
            <p>El visitante deberá abstenerse de utilizar el sitio de manera que pueda causar daños a LA EMPRESA, sus sistemas, sus proveedores, sus clientes o terceros.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">23. RESPONSABILIDAD DE LA EMPRESA</h2>
            <p className="mb-2">LA EMPRESA será responsable en los casos y dentro de los límites establecidos por la legislación peruana.</p>
            <p className="mb-2">Nada de estos Términos pretende excluir, limitar o desconocer derechos que legalmente correspondan a los consumidores.</p>
            <p>LA EMPRESA no será responsable por hechos que se encuentren fuera de su control razonable, sin perjuicio de las responsabilidades que legalmente no puedan ser excluidas o limitadas.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">24. FUERZA MAYOR Y CASO FORTUITO</h2>
            <p className="mb-2">LA EMPRESA no será responsable por incumplimientos o interrupciones derivados de acontecimientos imprevisibles o inevitables que se encuentren fuera de su control razonable.</p>
            <p className="mb-2">Entre estos pueden encontrarse, según corresponda:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-1 md:grid-cols-2">
              <li>Desastres naturales.</li>
              <li>Terremotos.</li>
              <li>Inundaciones.</li>
              <li>Incendios.</li>
              <li>Epidemias o pandemias.</li>
              <li>Conflictos sociales.</li>
              <li>Actos de autoridad.</li>
              <li>Fallas generalizadas de servicios públicos.</li>
              <li>Fallas de proveedores tecnológicos.</li>
              <li>Ataques informáticos.</li>
              <li>Interrupciones de Internet.</li>
              <li>Otros acontecimientos de fuerza mayor o caso fortuito reconocidos por la legislación peruana.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">25. RELACIÓN CONTRACTUAL</h2>
            <p className="mb-2">El uso del sitio web no genera por sí mismo una relación contractual para la ejecución de una obra o prestación de un servicio.</p>
            <p>Cuando un cliente contrate un servicio de LA EMPRESA, las obligaciones, derechos, precios, plazos, garantías, responsabilidades y demás condiciones serán determinadas mediante el contrato, propuesta, presupuesto, orden de servicio u otro documento correspondiente.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">26. CONTRATOS DE CONSTRUCCIÓN</h2>
            <p className="mb-2">Los proyectos de construcción contratados con LA EMPRESA estarán sujetos a las condiciones particulares establecidas en la documentación contractual correspondiente.</p>
            <p className="mb-2">Estos Términos de Uso del sitio web no sustituyen los contratos específicos de construcción, prestación de servicios, ejecución de obra u otros acuerdos que puedan celebrarse entre LA EMPRESA y sus clientes.</p>
            <p>En caso de existir contradicción entre estos Términos generales y un contrato específico, prevalecerán las disposiciones del contrato específico respecto de la relación contractual correspondiente, sin perjuicio de las normas imperativas aplicables.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">27. NORMATIVA DE PROTECCIÓN AL CONSUMIDOR</h2>
            <p className="mb-2">LA EMPRESA reconoce y respeta los derechos de los consumidores establecidos por la legislación peruana.</p>
            <p className="mb-2">En lo que resulte aplicable, se observará la <strong>Ley N.° 29571, Código de Protección y Defensa del Consumidor</strong>, y demás normas complementarias.</p>
            <p>Nada de estos Términos pretende restringir derechos reconocidos de manera imperativa por la legislación peruana.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">28. LIBRO DE RECLAMACIONES</h2>
            <p className="mb-2">Cuando resulte legalmente exigible de acuerdo con la actividad y modalidad de atención de LA EMPRESA, se pondrá a disposición de los consumidores el correspondiente <strong>Libro de Reclamaciones</strong>, conforme a la normativa peruana.</p>
            <p className="mb-2">La implementación y características del Libro de Reclamaciones se ajustarán a las obligaciones establecidas por la legislación peruana aplicable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">29. ATENCIÓN DE CONSULTAS Y RECLAMOS</h2>
            <p className="mb-2">Para consultas relacionadas con LA EMPRESA, sus servicios o el contenido del sitio web, los visitantes podrán utilizar los siguientes canales:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>Correo electrónico:</strong> <a href="mailto:mazaquiroz24@gmail.com" className="text-sky-400 hover:underline">mazaquiroz24@gmail.com</a></li>
              <li><strong>Teléfono:</strong> 985863448</li>
              <li><strong>Domicilio:</strong> Jr. Iquitos N.° 149</li>
            </ul>
            <p>Los reclamos de consumidores serán atendidos conforme a la legislación peruana aplicable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">30. MODIFICACIONES DEL SITIO WEB</h2>
            <p className="mb-2">LA EMPRESA podrá modificar, actualizar, ampliar, reducir, suspender o retirar contenidos o funcionalidades del sitio web cuando resulte necesario.</p>
            <p className="mb-2">Estas modificaciones podrán realizarse por motivos:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4 grid grid-cols-1 md:grid-cols-3">
              <li>Técnicos.</li>
              <li>Comerciales.</li>
              <li>Legales.</li>
              <li>De seguridad.</li>
              <li>De mantenimiento.</li>
              <li>De actualización.</li>
              <li>De mejora de experiencia del usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">31. MODIFICACIÓN DE ESTOS TÉRMINOS</h2>
            <p className="mb-2">LA EMPRESA podrá modificar estos Términos y Condiciones cuando sea necesario.</p>
            <p className="mb-2">La versión vigente será publicada en el sitio web indicando su fecha de actualización.</p>
            <p>Cuando una modificación requiera legalmente una comunicación o aceptación específica, LA EMPRESA adoptará las medidas correspondientes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">32. MEDIOS ELECTRÓNICOS</h2>
            <p className="mb-2">Las comunicaciones realizadas mediante medios electrónicos podrán producir efectos jurídicos cuando cumplan los requisitos establecidos por la legislación peruana.</p>
            <p className="mb-2">Cuando corresponda, podrán utilizarse medios electrónicos para comunicaciones, envío de documentos, aceptación de propuestas u otras actuaciones relacionadas con una eventual relación comercial.</p>
            <p>La utilización de medios electrónicos no implica por sí misma que exista una contratación, salvo que se cumplan las condiciones legales y contractuales correspondientes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">33. LEGISLACIÓN APLICABLE</h2>
            <p className="mb-2">Los presentes Términos y Condiciones se rigen por las leyes de la República del Perú.</p>
            <p className="mb-2">Entre las normas que pueden resultar aplicables se encuentran:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Constitución Política del Perú.</li>
              <li>Código Civil.</li>
              <li><strong>Ley N.° 29571, Código de Protección y Defensa del Consumidor.</strong></li>
              <li><strong>Ley N.° 29733, Ley de Protección de Datos Personales.</strong></li>
              <li><strong>Decreto Supremo N.° 016-2024-JUS, Reglamento de la Ley N.° 29733.</strong></li>
              <li><strong>Ley N.° 27291</strong>, sobre utilización de medios electrónicos para la manifestación de voluntad.</li>
              <li><strong>Ley N.° 27269, Ley de Firmas y Certificados Digitales</strong>, cuando corresponda.</li>
              <li><strong>Decreto Legislativo N.° 1044, Ley de Represión de la Competencia Desleal</strong>, cuando corresponda.</li>
              <li>Normativa peruana de propiedad intelectual aplicable.</li>
              <li>Demás normas que resulten aplicables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">34. PROTECCIÓN DE LOS DERECHOS DEL CONSUMIDOR</h2>
            <p className="mb-2">Ninguna disposición de estos Términos deberá interpretarse como una renuncia, limitación o eliminación de derechos reconocidos por normas imperativas de protección al consumidor.</p>
            <p>Cuando una disposición de estos Términos resulte incompatible con una norma de obligatorio cumplimiento, prevalecerá la norma legal correspondiente.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">35. NULIDAD PARCIAL</h2>
            <p className="mb-2">Si alguna disposición de estos Términos fuera declarada inválida, ilegal o inaplicable por una autoridad competente, las demás disposiciones permanecerán vigentes en la medida permitida por la legislación aplicable.</p>
            <p>La disposición afectada será interpretada o sustituida, cuando corresponda, de manera que se aproxime lo máximo posible a su finalidad original dentro de los límites legales.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">36. NO RENUNCIA</h2>
            <p>El hecho de que LA EMPRESA no ejerza inmediatamente algún derecho reconocido por estos Términos no deberá interpretarse como una renuncia permanente a dicho derecho.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">37. JURISDICCIÓN Y SOLUCIÓN DE CONTROVERSIAS</h2>
            <p className="mb-2">Las controversias relacionadas exclusivamente con el uso del sitio web serán sometidas a las autoridades y mecanismos de solución de controversias que resulten competentes conforme a la legislación peruana.</p>
            <p className="mb-2">Cuando se trate de una relación de consumo, se respetarán las competencias y mecanismos establecidos por la normativa de protección al consumidor.</p>
            <p>Cuando exista un contrato específico entre LA EMPRESA y un cliente, las controversias relacionadas con dicho contrato se resolverán conforme a las disposiciones establecidas en el contrato y a la legislación peruana aplicable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">38. VIGENCIA</h2>
            <p className="mb-2">Estos Términos y Condiciones entran en vigencia desde su publicación en el sitio web.</p>
            <p className="mb-2">Permanecerán vigentes hasta que sean modificados o sustituidos por una nueva versión.</p>
            <p><strong>Última actualización:</strong> 11 de agosto de 2026.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">39. DATOS DE CONTACTO</h2>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <p className="font-bold text-white mb-2">CONSTRUCTORA MAZA QUIROZ E.I.R.L.</p>
              <ul className="space-y-1">
                <li><strong>RUC:</strong> 20607520357</li>
                <li><strong>Domicilio:</strong> Jr. Iquitos N.° 149</li>
                <li><strong>Correo electrónico:</strong> <a href="mailto:mazaquiroz24@gmail.com" className="text-sky-400 hover:underline">mazaquiroz24@gmail.com</a></li>
                <li><strong>Teléfono:</strong> 985863448</li>
                <li><strong>Sitio web:</strong> <a href="https://techo-propio-sistema.vercel.app/" className="text-sky-400 hover:underline">https://techo-propio-sistema.vercel.app/</a></li>
              </ul>
            </div>
          </section>
        </div>
        
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>© 2026 CONSTRUCTORA MAZA QUIROZ E.I.R.L. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
